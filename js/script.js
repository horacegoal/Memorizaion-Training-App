let button;
let countries = ["美國", "加拿大", "百慕達", "波多黎各", "澳洲", "紐西蘭", "日本", "韓國", "新加坡", "臺灣", "香港", "以色列", "澳門", "安道爾", "奧地利", "比利時", "塞浦路斯", "捷克", "丹麥", "愛沙尼亞", "芬蘭", "法國", "德國", "冰島", "愛爾蘭", "意大利", "希臘", "拉脫維亞", "列支敦斯登", "立陶宛", "盧森堡", "馬耳他", "摩納哥", "荷蘭", "挪威", "葡萄牙", "聖馬利諾", "斯洛伐克", "斯洛文尼亞", "西班牙", "瑞典", "英國"]
let count = 0;
let db;
let words;

function setup() {
  noCanvas();
  background(0)
  httpGet('https://memorization-app-data-api.herokuapp.com/all', function(data){
      words = JSON.parse(data);
      let keys = Object.keys(words);
      let categoriesOptions = select('.categories');
      keys.forEach(function(category){
        categoriesOptions.option(category)
      })
  }, function(err){
    if(err){
      console.log(err);
    }
  })

  select('.categories').changed(adjustQuantityMax);
  select('#random_button').mousePressed(randomWord);
  select('#submit_button').mousePressed(checkAnswer);
  select('#hide_button').mousePressed(hideWord);
  select('#add').mousePressed(addInput);
  select('#addWord_button').mousePressed(addWord);
  var config = {
    apiKey: "AIzaSyCWN-lDo1KU9aOhQsbX9_ybZDwDYo4-Fzc",
    authDomain: "memory-4d8a3.firebaseapp.com",
    databaseURL: "https://memory-4d8a3.firebaseio.com",
    projectId: "memory-4d8a3",
    storageBucket: "memory-4d8a3.appspot.com",
    messagingSenderId: "303487253358"
  };
  firebase.initializeApp(config);
  db = firebase.database();

  let ref = db.ref('records');
  ref.on('value', getdata, getError)
  select('.best_record').html(`最佳記錄<hr>名字：${name}<br>詞數：${bestRecord}<br>時間(秒)：${bestTime}`);

}

function draw(){
  background(0);

  textSize(14)
  fill(255)
  textAlign(CENTER, CENTER)
  text(count, 55, 25)
}
let randomWords;


let startCounting = false;
let countingInterval;
function randomWord() {
  count = 0;
  if(countingInterval){
    clearInterval(countingInterval);
  }
  startCounting = true;
  if(startCounting){
    countingInterval = setInterval(function(){
      count++;
      select('.timer').html(count)
    }, 1000)
  }

  randomWords = [];
    select('.random_word').html('')
    select('#answer_box').value('')
    let selectValue = select('.categories').value();
    let quantity = select('#quantity').value();
    let category = select('.categories').value();
    let items = Object.keys(words[category]);
    let run;
    if(quantity <= items.length){
      run = true;
    }else{
      alert(`冇咁多詞語 得${items.length}個`);
    }

    let checkList = {};
    while(run){
      let word;
       let keys = Object.keys(words[selectValue]);
       word = random(keys);
       if(!checkList[word]){
        checkList[word] = true;
        randomWords.push(word);
        let p = createP(word);
        p.id(word);
        let parent = select('.random_word');
        p.parent(parent)
      }
      if(randomWords.length == quantity){
        run = false;
      }
    }
    select('.correct_number').html('0')
}



let submmitable = false;
let numbersOfCorrect = 0;
let bestRecord = 0;
let bestTime = 0;
let bestName = '';

function checkAnswer(){
  if(submmitable){
    numbersOfCorrect = 0;
    let answer = select('#answer_box').value();
    let answerArray = answer.split(/\s+/);
    for(let j = 0; j < answerArray.length; j++){
      for(let i = 0; i < randomWords.length; i++){
        if(answerArray[j] === randomWords[i]){
          select(`#${answerArray[j]}`).style('color', 'white');
          numbersOfCorrect++;
        }
      }
    }
    for(let i = 0; i < randomWords.length; i++){
      select(`#${randomWords[i]}`).show();
    }
    let number = select('.correct_number');
    number.html(numbersOfCorrect)
    clearInterval(countingInterval);
    saveRecord();
    let ref = db.ref('records');
    ref.on('value', getdata, getError)

  }
  submmitable = false;
}
function getdata (data) {
  let records = data.val();
  let keys = Object.keys(records);
  for(let i = 0; i < keys.length; i++){
    let corretWords = records[keys[i]].correct_words
    if(corretWords > bestRecord) {
      bestRecord = corretWords;
      bestTime = records[keys[i]].time;
      name = records[keys[i]].name;
    }else if(corretWords === bestRecord && records[keys[i]].time < bestTime){
      bestRecord = corretWords;
      bestTime = records[keys[i]].time;
      name = records[keys[i]].name;
    }
    select('.best_record').html(`最佳記錄<hr>名字：${name}<br>詞數：${bestRecord}<br>時間(秒)：${bestTime}`);
  }
}

function getError (err){
  console.log('error', err);
}

function hideWord(){
  for(let i = 0; i < randomWords.length; i++){
    select(`#${randomWords[i]}`).hide();
  }
  select('#answer_box').removeAttribute('disabled');
  submmitable = true;
}
let order = 11;
function addInput(){
  let parent = select('.memory_palace_input')
  let span = createSpan(`${order}.`)
  span.parent(parent)
  order++;
  let input = createInput();
  input.style('margin-right', '3px')
  input.parent(parent);
}

particlesJS.load('particles-js', 'assets/particles.json', function() {
  console.log('callback - particles.js config loaded');
});

function saveRecord() {
  let username = select('#username');
  let data = {
    name: username.value(),
    time: count,
    correct_words: numbersOfCorrect
  }
  db.ref("records").push(data);
}

function addWord(){
  let category = select('#category_input').value();
  let name = select('#name_input').value();
  let data = {
    category: category,
    name: name
  }
  let deliveryMessage = select('#delivery_message');

  if(words[category][name]){
    return deliveryMessage.html('該詞語已存在')
  }
  deliveryMessage.html('傳送中');
  httpPost('https://memorization-app-data-api.herokuapp.com/add', data, function(res){
    deliveryMessage.html('傳送成功！');
  }, function(err){
    console.log(err)
  });
}
function adjustQuantityMax(){
  select('#quantity').value(1);

  let category = select('.categories').value();
  let items = Object.keys(words[category]);
  select('#quantity').attribute('max', items.length);
}
