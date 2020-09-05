/**
 *
 * 运行前：请先填写Appid、APIKey、APISecret
 *
 * 实时转写调用demo
 * 此demo只是一个简单的调用示例，不适合用到实际生产环境中
 * 
 * @author white
 *
 */
const CryptoJS = require('crypto-js')
const WebSocket = require('ws')
const AudioRecorder = require('node-audiorecorder');
const DIRECTORY = 'examples-recordings';

// Options is an optional parameter for the constructor call.
// If an option is not given the default value, as seen below, will be used.
const options = {
  program: `sox`,     // Which program to use, either `arecord`, `rec`, or `sox`.
  //device: `hw:2,0`,       // Recording device to use, e.g. `hw:1,0`
 
  bits: 16,           // Sample size. (only for `rec` and `sox`)
  channels: 1,        // Channel count.
  encoding: `signed-integer`,  // Encoding type. (only for `rec` and `sox`)
  format: `S16_LE`,   // Encoding type. (only for `arecord`)
  rate: 16000,        // Sample rate.
  type: `wav`,        // Format type.
 
  // Following options only available when using `rec` or `sox`.
  silence: 0,         // Duration of silence in seconds before it stops recording.
  //thresholdStart: 0.5,  // Silence threshold to start recording.
  //thresholdStop: 0.5,   // Silence threshold to stop recording.
  //keepSilence: true   // Keep the silence in the recording.
};
// The object has to implement a log and warn function.
const logger = console;
 
// Create an instance.
let audioRecorder = new AudioRecorder(options, logger);

//
var fs = require('fs')
var log = require('log4node')
const path = require('path');
// 系统配置
const config = {
  // 请求地址
  hostUrl: "ws://rtasr.xfyun.cn/v1/ws",
  //在控制台-我的应用-实时语音转写获取
  appid: "5f080cd1",
  //在控制台-我的应用-实时语音转写获取
  apiKey: "fa8c84c0c041b8325817ce145723726e",
  file: "./test_1.pcm",//请填写您的音频文件路径
  highWaterMark: 1280
}

// 获取当前时间戳
let ts = parseInt(new Date().getTime() / 1000)

let wssUrl = config.hostUrl + "?appid=" + config.appid + "&ts=" + ts + "&signa=" + getSigna(ts)
let ws = new WebSocket(wssUrl)

// 连接建立完毕，读取数据进行识别
ws.on('open', (event) => {
  log.info("websocket connect!")
})

//build socket connection to TEDMirror module

const net = require('net');
const socket = new net.Socket();
const port = 3000;
const hostname = 'localhost';
socket.setEncoding('UTF-8');

socket.connect( port,hostname,function(){
  socket.write('Recording Started');
});

socket.on( 'data', function ( msg ) {
  console.log( msg );
});

socket.on( 'error', function ( error ) {
  console.log( 'error' + error );
});

socket.on('close',function(){
  console.log('服务器端下线了');
});

const socket2 = new net.Socket();
const port2 = 4000;
socket2.setEncoding('UTF-8');

socket2.connect( port2,hostname,function(){
  socket2.write('Evaluation Started');
});

socket2.on( 'data', function ( msg ) {
  console.log( msg );
});

socket2.on( 'error', function ( error ) {
  console.log( 'error' + error );
});

socket2.on('close',function(){
  console.log('服务器端下线了');
});

var total_wd = 0;
var filler_wd = 0;
filler_set = new Set(["um", "uh","umm","mmm","en", "you know"])

// 得到识别结果后进行处理，仅供参考，具体业务具体对待
let rtasrResult = []
ws.on('message', (data, err) => {
  if (err) {
    log.info(`err:${err}`)
    //slog(`err:${err}`)
    return
  }
  let res = JSON.parse(data)
  switch (res.action) {
    case 'error':
      log.info(`error code:${res.code} desc:${res.desc}`)
      break
      // 连接建立
    case 'started':
      log.info('started!')
      log.info('sid is:' + res.sid)

      // Create path to write recordings to.
      if (!fs.existsSync(DIRECTORY)){
        fs.mkdirSync(DIRECTORY);
      }
      // Create file path with random name.
      const fileName = path.join(DIRECTORY, Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4).concat('.wav'));
      log.info('Writing new recording file at: ', fileName);

      // Create write stream.
      
      const fileStream = fs.createWriteStream(fileName, { encoding: 'binary' });
      // Start and write to the file.
      audioRecorder.start().stream().pipe(fileStream);
      //audioRecorder.start()
      // Listen to events.
      audioRecorder.stream().on('close', function(code) {
  		log.info('Recording closed. Exit code: ', code);
      });
      audioRecorder.stream().on('error', function(error) {
		log.info('Error msg: ${error}')
      });
      audioRecorder.stream().on('end', function() {
		log.info('Audio stream closed');
		
		// Stop audio recorder.
		//audioRecorder.stop();
	// Exit the program, perhaps here you want to re-enable the hotword detector again.
	//process.exit(1);
	});
      audioRecorder.stream().on('data', function (chunk) {
	    //log.info('here are a chunk')
        ws.send(chunk)
      });
      break
    case 'result':
      // ... do something
      let data = JSON.parse(res.data)
      rtasrResult[data.seg_id] = data
	  //only print final recog. result

	  if (data.cn.st.type == 0) {
		let str= ""
		data.cn.st.rt.forEach(j => {
            j.ws.forEach(k => {
              k.cw.forEach(l => {
                str += l.w
              })
            })
          })
		socket.write(str)
		total_wd += str.split(" ").length
		for (var x of filler_set){
			filler_wd += get_filler_num(str.toLowerCase(),x)
		}	
		socket2.write("Total Word #:"+total_wd+'\n'+"Total Filler #:"+filler_wd)
	    log.info(str)
	  }	  
	  


      break
  }
})

// 资源释放
ws.on('close', () => {
  log.info('connect close!')
})

// 建连错误
ws.on('error', (err) => {
  log.error("websocket connect err: " + err)
})

// 鉴权签名
function getSigna(ts) {
  let md5 = CryptoJS.MD5(config.appid + ts).toString()
  let sha1 = CryptoJS.HmacSHA1(md5, config.apiKey)
  let base64 = CryptoJS.enc.Base64.stringify(sha1)
  return encodeURIComponent(base64)
}
function get_filler_num(one_str, filler){
	let count =0;
	let index = one_str.indexOf(filler);
	while (index !== -1){
		count++;
		index = one_str.indexOf(filler, index+1);
	}
	return count
}
