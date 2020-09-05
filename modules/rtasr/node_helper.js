'use strict';

/* Magic Mirror
 * Module: voicecontrol
 *
 * By Alex Yaknin 
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const spawn = require('child_process').spawn;
const net = require('net');
const server = net.createServer();

module.exports = NodeHelper.create({
    start: function () {
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === "CONNECT") {
			this.startRecognition();
			return;
		}
	},

	startRecognition : function() {
		var self = this
        server.on('connection',function (socket) {
        
			socket.setEncoding('utf8');
        	console.log('客户端与服务端链接已建立');
        	socket.on('data',function (data) {
                console.log('已收到客户端发来的数据：'+data);//控制台输出
                //socket.write('确认数据：'+data);//发送给客户端
				self.sendSocketNotification('ASR_RESULT', data)
				console.log("SocketNotification has been sent")
            });

            //监听与客户端连接的错误事件
            socket.on('error',function (err) {
				var msg = '与客户端通信或链接过程中发生了一个错误，错误代码为：'+err.code
            	console.log('与客户端通信或链接过程中发生了一个错误，错误代码为：%s',err.code);
                //当发生错误时，用destroy方法销毁该socket端口。确保不会再被利用
				self.sendSocketNotification('SOCKET_ERR', msg)
                socket.destroy();
            })

 			//监听客户端的end事件
            socket.on('end',function () {
            	console.log('客户端连接被关闭')
                //默认情况下，运行TCP服务器的应用程序不会自动退出，即使客户端全部关闭。
                //我们可以使用server.unref();方法退出应用程序
                //当时用unref()方法后，我们可以用server.ref();方法阻止应用程序的退出
				self.sendSocketNotification('SOCKET_END', '客户端连接被关闭')
                server.unref();
            });
            //当socket端口彻底关闭时，触发socket端口的close事件
            socket.on('close',function (had_error) {
            	if(had_error){
                	console.log('由于一个错误导致socket端口被关闭');
					self.sendSocketNotification('SOCKET_CLOSE', '由于一个错误导致socket端口被关闭')
                    server.unref();
                }else {
                    console.log('socket端口被正常关闭')
					self.sendSocketNotification('SOCKET_CLOSE', 'Recording Stopped')
                }
            });

            server.getConnections(function (err, count) {
				if(count == 2)
                	server.close();
            })
        });
		server.listen(3000,'localhost');
    },

	
	/*
    socketNotificationReceived: function(notification, payload) {
    	if (notification === "CONNECT") {
        	this.startRecognition(payload);
            return;
        }
    },

    startRecognition : function(config) {

        var models = config.models;

        var kwsSensitivity = 0.5;
        this.started = true;
        var self = this;
        // Initilize the keyword spotter
        var params = ['./modules/voicecontrol/snowboy/kws-multiple.py']; //, modelFile1, modelFile2];


        models.forEach(function(model) {
            params.push(model.file);
        }, this);

        //var kwsProcess = spawn('python', ['./speech-osx/kws-multiple.py', modelFile1, modelFile2], { detached: false });
        var kwsProcess = spawn('python', params, { detached: false });
        // Handel messages from python script
        kwsProcess.stderr.on('data', function (data) {
            var message = data.toString();
            if (message.startsWith('INFO')) {
                var items = message.split(':');
                var index = parseInt(items[2].split(' ')[1]);
                var model = models[index - 1];
                self.sendSocketNotification("KEYWORD_SPOTTED", model);

            } else {
                console.error(message);
            }
        })
        kwsProcess.stdout.on('data', function (data) {
            console.log(data.toString());
        })
    }
	*/

});

                
