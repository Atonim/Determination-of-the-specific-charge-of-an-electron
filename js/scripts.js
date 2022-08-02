'use strict';
function warming_up() {
  return new Promise(resolve => setTimeout(resolve, 50)); //задежка цикла на разогрев
}
//сеть
let power = false;
//амперметр
let power_amp = false;
let amp_sign = 1; // направление тока
// отклоняющее напряжение
let deflecting_voltage = false;
let def_sign = 1; //направление отклоняющего напряжения
//физ величины
const Ud_Zar = 1.7588 * Math.pow(10, 11); // удельный заряд
const N = 180; //количество витков в катушке Геймгольца
const R = 0.135;//радиус катушек
const Mag_Post = 4 * Math.PI * Math.pow(10, -7); //магнитная постоянная

let Uskor_U = 0; //ускоряющее напряжение
let Def_U = 0; //отклоняющее напряжение
let I = 0; //сила тока

//огонек
let light = document.querySelector('#light');//огонек
let light_opacity = 0;

//canvas
const cnv = document.querySelector('canvas');
const ctx = cnv.getContext('2d');
ctx.lineWidth = 2;
let cnv_opacity = 0.000000001;

//спираль
const centerX = 225; //координаты начала спирали
const centerY = 373; //координаты начала спирали

//ползунки
let rangeMeter1 = document.querySelector('#range1');
let rangeMeter2 = document.querySelector('#range2');
let rangeMeter3 = document.querySelector('#range3');

//стрелочки
let rangeClock1 = document.querySelector('.meter-clock1');
let rangeClock2 = document.querySelector('.meter-clock2');

//тут все состояния сети
let power_radio = document.getElementsByName('switch-power');

//отслеживаем состояния сети
for (let i = 0; i < power_radio.length; i++) {
  power_radio[i].onchange = switchradio;
}

//меняем состяние сети
function switchradio() {

  if (power_radio[0].checked) { //сеть вкл
    power = true;
    //привожу в порядок стрелочки
    rangeClock1.style.transform = 'rotate(' + (-53 + (rangeMeter1.value * 0.35)) + 'deg)';
    rangeClock2.style.transform = 'rotate(' + (-53 + (rangeMeter2.value * 0.35)) + 'deg)';

    //устанавлию физ величины
    Uskor_U = rangeMeter1.value;
    I = rangeMeter2.value / 100;
    Def_U = rangeMeter3.value;
  } else { //сеть выкл
    power = false;
    //привожу в порядок стрелочки
    rangeClock2.style.transform = 'rotate(-53deg)';
    rangeClock1.style.transform = 'rotate(-53deg)';
    //обнуляю физ величины
    I = 0;
    Uskor_U = 0;
    Def_U = 0;
    //огонек выкл
    light_opacity = 0;
    //прозрачность обнуляем
    cnv_opacity = 0.000000001;

    light.style.opacity = light_opacity;
    ctx.globalAlpha = cnv_opacity;
  }
}

//направление тока
let amp_radio = document.getElementsByName('switch-amperage');

//отслеживаем состояние направления
for (let i = 0; i < amp_radio.length; i++)
  amp_radio[i].onchange = switch_amp;

//меняем направление
function switch_amp() {
  if (amp_radio[0].checked) {
    amp_sign = -1;
    power_amp = true;
  }
  if (amp_radio[1].checked) {
    power_amp = false;
    amp_sign = 1;
  }
  if (amp_radio[2].checked) {
    amp_sign = 1;
    power_amp = true;
  }
}

//отклоняющее напряжение
let def_volt_radio = document.getElementsByName('switch-voltage')

//отслеживаем состояние отклонения
for (let i = 0; i < def_volt_radio.length; i++)
  def_volt_radio[i].onchange = switch_def_volt;

//меняем отклонение
function switch_def_volt() {
  if (def_volt_radio[0].checked) {
    deflecting_voltage = true
    def_sign = 1
    rangeChange3();
  }
  if (def_volt_radio[1].checked) {
    deflecting_voltage = false
    def_sign = 0;
  }
  if (def_volt_radio[2].checked) {
    deflecting_voltage = true
    def_sign = -1;
    rangeChange3();
  }

}

//<!--
//_______________________________________________________________________
//                                СТРЕЛОЧКИ И ПОЛЗУНКИ
//_______________________________________________________________________
//-->

function rangeChange3() {
  if (power === true) {
    Def_U = rangeMeter3.value;
    if (!deflecting_voltage)
      Def_U = 0;
  }
}

function rangeChange2() {
  if (power === true) {
    rangeClock2.style.transform = 'rotate(' + (-53 + (rangeMeter2.value * 0.35)) + 'deg)';
    I = rangeMeter2.value / 100;
  }
}

function rangeChange1() {
  if (power === true) {
    rangeClock1.style.transform = 'rotate(' + (-53 + (rangeMeter1.value * 0.35)) + 'deg)';
    Uskor_U = rangeMeter1.value;
  }
}

rangeMeter3.addEventListener('input', rangeChange3);
rangeMeter2.addEventListener('input', rangeChange2);
rangeMeter1.addEventListener('input', rangeChange1);


/*_______________________________________________________________________
  *************************************************************************
  *************************************************************************
                                  CANVAS
  *************************************************************************
  *************************************************************************
  _______________________________________________________________________*/
(() => {
  function drawRing() {
    if (power && (cnv_opacity < 1)) { //6400 итераций
      light.style.opacity = light_opacity; //устанавливаем прозрачность огонька
      //повышаем все значения
      light_opacity += 0.01;
      if (cnv_opacity > 0.08)
        cnv_opacity *= 1.004
      else
        cnv_opacity *= 1.02;
    }

    ctx.strokeStyle = 'lightgreen';
    ctx.beginPath(); // начинаем линию
    ctx.moveTo(centerX, centerY); //координаты начала линии

    let h2 = 0.0075, h1 = 0.0065, l = 0.009;

    let a = 0
    let B = Math.pow((4 / 5), (3 / 2)) * Mag_Post * N * I / R; //магнитная индукция
    let ringRadius = Math.sqrt((2 * Uskor_U) / (Ud_Zar * Math.pow(B, 2))); //радиус окружности
    ringRadius *= 100; //перевожу в сантиметры

    let x = centerX;
    let y = centerY;
    let chains = 400;
    let k = 2.2;

    if (Uskor_U <= 120) { //если ускор напр меньше 120 то рисует только маленький кусочек
      ctx.globalAlpha = cnv_opacity;
      chains = Uskor_U / 250 * 20;
      for (let j = 0; j < chains; j++) {
        let currentAngle = j * Math.PI / 180;  //переводим градусы в радианы
        x = x + Math.cos(currentAngle);//новая координата по х// 1.4 - коэффициент для "округления"
        y = y - amp_sign * Math.sin(currentAngle);//новая координата по y
        ctx.lineTo(x, y)  //конец линии

      }
      ctx.stroke(); //отрисовка всех линий
    }


    else {
      let j = 0, x1 = 2.5 * 1.8 //2.5 - пикселя 

      for (j = 0; j <= 10; j++) { //отрисовываем первые 10 цепочек заданной длины
        ctx.globalAlpha = (chains - j) * cnv_opacity / chains; // прозрачность
        let currentAngle = j * Math.PI / 180;

        a = def_sign * Math.atan(((Def_U * l) / (2 * Uskor_U * (h2 - h1)) * Math.log(1 + j / 10 * (h2 / h1 - 1)) + 1.6 * Math.pow(10, -19) *
          B * j / (10 * Math.sqrt(2 * Ud_Zar * Uskor_U)))) //в радианах
        //здесь а - тангенс угла отклонения 
        if (I == 0 || !power_amp)
          currentAngle = 0;
        x = x + x1;
        y = y - amp_sign * x1 * Math.tan(currentAngle + a);

        ctx.lineTo(x, y)
        if (Math.pow(x - 225, 2) + Math.pow(y - 225, 2) >= Math.pow(225, 2))
          break;
        //если касается верхней пластины - завершает отрисовку
        if (x >= 217 && x <= 250 && y >= 357 && y <= 363)
          break;
        //если касается нижней пластины - завершает отрисовку
        if (x >= 225 && x <= 247 && y >= 379)
          break;
        //если касается пушки - завершает отрисовку

        if (x >= 202 && x <= 207 && y >= 342 && y <= 442)
          break;
        j++;
      }
      ctx.stroke() //отрисовка всех линий}

      a = def_sign * Math.atan(Def_U * l * Math.log(h2 / h1) / (2 * Uskor_U * (h2 - h1))) //в радианах

      if (power_amp) {
        for (; j < chains; j++) {
          ctx.globalAlpha = (chains - j) * cnv_opacity / chains; // прозрачность
          let currentAngle = j * Math.PI / 180;  //переводим градусы в радианы

          if (I == 0) {
            currentAngle = 0;
            ringRadius = 10;
          }

          if (I > 0 && I <= 0.1) {
            x = x + 20 * Math.cos(currentAngle + a);//новая координата по х
            y = y - amp_sign * 20 * Math.sin(currentAngle + a);//новая координата по y

            ctx.lineTo(x, y)


          }
          else {

            x = x + ringRadius / k * Math.cos(currentAngle + a);//новая координата по х
            y = y - amp_sign * ringRadius / k * Math.sin(currentAngle + a);//новая координата по y

            ctx.lineTo(x, y)  //конец линии
          }



          //если касается границ - завершает отрисовку
          if (Math.pow(x - 225, 2) + Math.pow(y - 225, 2) >= Math.pow(225, 2))
            break;
          ////если касается верхней пластины - завершает отрисовку
          if (x >= 217 && x <= 250 && y >= 357 && y <= 363)
            break;
          ////если касается нижней пластины - завершает отрисовку
          if (x >= 225 && x <= 247 && y >= 379 && y <= 385)
            break;
          ////если касается пушки - завершает отрисовку
          if (x >= 202 && x <= 210 && y >= 342 && y <= 442)
            break;

          ctx.stroke(); //решил отрисовывать отдельно каждую линию
        }
      } else {
        for (; j < chains; j++) {
          ctx.globalAlpha = (chains - j) * cnv_opacity / chains; // прозрачность
          x += 10 * Math.cos(a)
          y = y - 10 * Math.sin(a)

          ctx.lineTo(x, y)  //конец линии

          //если касается границ - завершает отрисовку
          if (Math.pow(x - 225, 2) + Math.pow(y - 225, 2) >= Math.pow(225, 2))
            break;
          //если касается верхней пластины - завершает отрисовку
          if (x >= 217 && x <= 250 && y >= 357 && y <= 363)
            break;
          //если касается нижней пластины - завершает отрисовку
          if (x >= 225 && x <= 247 && y >= 379 && y <= 385)
            break;
          //если касается пушки - завершает отрисовку
          if (x >= 202 && x <= 210 && y >= 342 && y <= 442)
            break;

          ctx.stroke(); //решил отрисовывать отдельно каждую линию
        }
      }
    }
  }

  //обновление спирали

  function loop() {
    cnv.width |= 0;
    drawRing();
    if (power && (cnv_opacity < 1)) {
      warming_up().then(() => {
        requestAnimationFrame(loop)
      });
    }
    else
      requestAnimationFrame(loop)

  }
  loop();
})();

