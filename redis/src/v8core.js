/*
 * Copyright (c) 2013, Arseniy Pavlenko <h0x91b@gmail.com>
 * All rights reserved.
 * Copyright (c) 2009-2012, Salvatore Sanfilippo <antirez at gmail dot com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *	 * Redistributions of source code must retain the above copyright notice,
 *		 this list of conditions and the following disclaimer.
 *	 * Redistributions in binary form must reproduce the above copyright
 *		 notice, this list of conditions and the following disclaimer in the
 *		 documentation and/or other materials provided with the distribution.
 *	 * Neither the name of Redis nor the names of its contributors may be used
 *		 to endorse or promote products derived from this software without
 *		 specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
redis.str = {};
redis.last_error = '';
redis.v8_start = +new Date;
redis._runcounter = 0;

window = this;

function jscall_wrapper_function(){
	var self, func;

	self = window;
	func = eval('('+arguments[0]+')');
	if(typeof func != 'function'){
		redis.last_error = '-Function "'+arguments[0]+'" not found';
		return redis.last_error;
	}
	var funcname = arguments[0].split('.');
	funcname.pop();
	if(funcname.length>0){
		self = eval('('+funcname.join('.')+')');
	}

	var args = Array(arguments.length-1);
	for(var i=0;i<arguments.length-1;i++){
		args[i] = arguments[i+1];
	}
	var commands = redis._runcounter;
	var ret = func.apply(self,args)
	if(ret === undefined) ret = null;
	if(ret === false) return redis.last_error;
	var ret_obj = {ret:ret,cmds:redis._runcounter-commands};
	return JSON.stringify(ret_obj);
}

redis._run = function(){
	redis._runcounter++;
	redis.last_error = '';
	redis.str = redis.__run.apply(this,arguments);
	if(redis.str===false){
		redis.last_error = redis.getLastError();
	}
	return redis.str;
}

redis.inline_return = function(){
	var commands = redis._runcounter;
	var ret = inline_redis_func();
	if(ret === undefined) ret = null;
	if(ret === false) return redis.last_error;
	var ret_obj = {ret:ret,cmds:redis._runcounter-commands};
	return JSON.stringify(ret_obj);
}

redis.v8stats = function(){
	return JSON.stringify({
		command_processed: redis._runcounter,
		ops_per_second: Math.floor(redis._runcounter/((+new Date - redis.v8_start)/1000))
	});
}

/* 
* standart redis functions 
* you can find info on http://redis.io/commands
* some commands like PUBLISH SUBSCRIPE MONITOR are omited
* if some command missing you can use redis._run("missing_command","arg1","arg2")
*/

redis.append = function(key,value){
	return this._run('APPEND',key,value);
}

redis.bgrewriteaof = function(){
	return this._run('BGREWRITEAOF');
}

redis.bgsave = function(){
	return this._run('BGSAVE');
}

redis.bitcount = function(key){
	if(arguments.length==1){
		return this._run('BITCOUNT',key);
	}
	var args = Array(arguments.length+1);
	args[0] = 'BITCOUNT';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.bitop = function(operation,destkey,key){
	if(arguments.length==3){
		return this._run('BITOP',operation,destkey,key);
	}
	var args = Array(arguments.length+1);
	args[0] = 'BITOP';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.blpop = function(key,timeout){
	if(arguments.length==2){
		return this._run('BLPOP',key,timeout);
	}
	var args = Array(arguments.length+1);
	args[0] = 'BLPOP';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.brpop = function(key,timeout){
	if(arguments.length==2){
		return this._run('BRPOP',key,timeout);
	}
	var args = Array(arguments.length+1);
	args[0] = 'BRPOP';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.brpoplpush = function(source,destination,timeout){
	return this._run('BRPOPLPUSH',source,destination,timeout);
}

redis.client_kill = function(ip_port){
	return this._run('CLIENT','KILL',ip_port);
}

redis.client_list = function(){
	return this._run('CLIENT','LIST');
}

redis.client_getname = function(){
	return this._run('CLIENT','GETNAME');
}

redis.client_setname = function(name){
	return this._run('CLIENT','SETNAME',name);
}

redis.config_get = function(parameter){
	return this._run('CONFIG','GET',parameter);
}

redis.config_set = function(parameter,value){
	return this._run('CONFIG','SET',parameter,value);
}

redis.config_resetstat = function(){
	return this._run('CONFIG','RESETSTAT');
}

redis.dbsize = function(){
	return this._run('DBSIZE');
}

redis.bgsave = function(){
	return this._run('BGSAVE');
}

redis.debug_object = function(key){
	return this._run('DEBUG','OBJECT',key);
}

redis.debug_segfault = function(){
	return this._run('DEBUG','SEGFAULT');
}

redis.decr = function(key) {
	if(typeof key != 'string' || key.length<1){
		redis.last_error = '-Not specified key';
		return false;
	}
	redis._runcounter++;
	redis.last_error = '';
	redis.str = this.__incrby(key,-1);
	if(redis.str===false){
		redis.last_error = redis.getLastError();
	}
	return redis.str;
}

redis.decrby = function(key,decrement) {
	if(typeof key != 'string' || key.length<1){
		redis.last_error = '-Not specified key';
		return false;
	}
	redis._runcounter++;
	redis.last_error = '';
	redis.str = this.__incrby(key,-decrement);
	if(redis.str===false){
		redis.last_error = redis.getLastError();
	}
	return redis.str;
}

redis.del = function(key){
	if(arguments.length>1){
		for(var i=0;i<arguments.length;i++)
			this._run('DEL',arguments[i]);
		return;
	}
	return this._run('DEL',key);
}

redis.dump = function(key){
	redis.last_error = 'cant handle binary data, not implemented yet';
	return false;
	
	redis._runcounter++;
	redis.last_error = '';
	var rez = this.__run('dump',key);
	rez = rez.map(function(char){
		return escape(String.fromCharCode(char));
	})
	return rez.join('');
}

redis.echo = function(message){
	return this._run('ECHO',message);
}

redis.eval = function(){
	var args = Array(arguments.length+1);
	args[0] = 'EVAL';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.evalsha = function(){
	var args = Array(arguments.length+1);
	args[0] = 'EVALSHA';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.exists = function(key){
	return this._run('EXISTS',key);
}

redis.expire = function(key,seconds){
	return this._run('EXPIRE',key,seconds);
}

redis.expireat = function(key,timestamp){
	return this._run('EXPIREAT',key,timestamp);
}

redis.flushall = function(){
	return this._run('FLUSHALL');
}

redis.flushdb = function(){
	return this._run('FLUSHDB');
}

redis._get = function(key) {
	redis._runcounter++;
	redis.last_error = '';
	redis.str = redis.__run('GET',key);
	if(redis.str===false){
		redis.last_error = redis.getLastError();
	}
	return redis.str;
}

redis.get = function(key){
	if(typeof key != 'string' || key.length<1){
		return this._get(key);
	}
	redis._runcounter++;
	redis.last_error = '';
	return this.__get(key);
}

redis.getbit = function(key,offset){
	return this._run('GETBIT',key,offset);
}

redis.getrange = function(key,start,end){
	return this._run('GETRANGE',key,start,end);
}

redis.getset = function(key,value){
	return this._run('GETSET',key,value);
}

redis.hdel = function(key,field){
	if(arguments.length==2){
		return this._run('HDEL',key,field);
	}
	var args = Array(arguments.length+1);
	args[0] = 'HDEL';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.hexists = function(key,field){
	return this._run('HEXISTS',key,field);
}

redis.hget = function(key,field){
	return this._run('HGET',key,field);
}

redis.hgetall = function(key){
	redis._runcounter++;
	redis.last_error = '';
	redis.str = redis.__run.apply(this,['HGETALL',key]);
	
	if(redis.str.length<1) return null;
	
	var resp = redis.str;
	var ret = {};
	for(var i=0; i<resp.length; i+=2){
		ret[resp[i]] = resp[i+1];
	}
	return ret;
}

redis.hincrby = function(key,field,increment){
	return this._run('HINCRBY',key,field,increment)
}

redis.hincrbyfloat = function(key,field,increment){
	return this._run('HINCRBYFLOAT',key,field,increment);
}

redis.hkeys = function(key){
	return this._run('HKEYS',key);
}

redis.hlen = function(key){
	return this._run('HLEN',key);
}

redis.hmget = function(key,fields){
	redis._runcounter++;
	redis.last_error = '';
	var args = fields;
	if(Array.isArray(fields)){
		args.unshift(key);
		args.unshift('HMGET');
	} else {
		args = Array(arguments.length+1);
		args[0] = 'HMGET';
		for(var i=0;i<arguments.length;i++)
			args[i+1] = arguments[i];
	}
	redis.str = redis.__run.apply(this,args);
	
	var resp = redis.str;
	var ret = {};
	for(var i=0;i<resp.length;i++)
		ret[args[i+2]] = resp[i];
	return ret;
}

redis.hmset = function(key, obj){
	var f = ['HMSET',key];
	for(var k in obj){
		f.push(k);
		f.push(obj[k]);
	}
	return this._run.apply(this,f);
}

redis.hset = function(key,field,value){
	return this._run('HSET',key,field,value);
}

redis.hsetnx = function(key,field,value){
	return this._run('HSETNX',key,field,value);
}

redis.hvals = function(key){
	return this._run('HVALS',key);
}

redis.incr = function(key){
	if(typeof key != 'string' || key.length<1){
		redis.last_error = '-Not specified key';
		return false;
	}
	redis._runcounter++;
	redis.last_error = '';
	redis.str = this.__incrby(key,1);
	if(redis.str===false){
		redis.last_error = redis.getLastError();
	}
	return redis.str;
}

redis.incrby = function(key,increment){
	if(typeof key != 'string' || key.length<1){
		redis.last_error = '-Not specified key';
		return false;
	}
	redis._runcounter++;
	redis.last_error = '';
	redis.str = this.__incrby(key,increment);
	if(redis.str===false){
		redis.last_error = redis.getLastError();
	}
	return redis.str;
}

redis.incrbyfloat = function(key,increment){
	return this._run('INCRBYFLOAT',key,increment);
}

redis.info = function(){
	if(arguments.length==0){
		return this._run('INFO');
	}
	var args = Array(arguments.length+1);
	args[0] = 'INFO';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.keys = function(pattern){
	return this._run('KEYS',pattern);
}

redis.lastsave = function(){
	return this._run('LASTSAVE');
}

redis.lindex = function(key,index){
	return this._run('LINDEX',key,index);
}

redis.linsert = function(key,before_after,pivot,value){
	return this._run('LINSERT',key,before_after,pivot,value);
}

redis.llen = function(key){
	return this._run('LLEN',key);
}

redis.lpop = function(key){
	return this._run('LPOP',key);
}

redis.lpush = function(key,value){
	if(arguments.length==2){
		return this._run('LPUSH',key,value);
	}
	var args = Array(arguments.length+1);
	args[0] = 'LPUSH';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.lpushhx = function(key,value){
	return this._run('LPUSHX',key,value);
}

redis.lrange = function(key,start,stop){
	return this._run('LRANGE',key,start,stop);
}

redis.lrem = function(key,count,value){
	return this._run('LREM',key,count,value);
}

redis.lset = function(key,index,value){
	return this._run('LSET',key,index,value);
}

redis.ltrim = function(key,start,stop){
	return this._run('LTRIM',key,start,stop);
}

redis.mget = function(key){
	if(arguments.length==1){
		return this._run('MGET',key);
	}
	var args = Array(arguments.length+1);
	args[0] = 'MGET';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}
// MIGRATE host port key destination-db timeout
redis.migrate = function(){
	this.last_error = 'not supported yet';
	return false;
}

redis.move = function(key,db){
	return this._run('MOVE',key,db);
}

redis.mset = function(key,value){
	if(arguments.length==2){
		return this._run('MSET',key,value);
	}
	var args = Array(arguments.length+1);
	args[0] = 'MSET';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.msetnx = function(key,value){
	if(arguments.length==2){
		return this._run('MSETNX',key,value);
	}
	var args = Array(arguments.length+1);
	args[0] = 'MSETNX';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.object = function(subcommand){
	if(arguments.length==1){
		return this._run('OBJECT',subcommand);
	}
	var args = Array(arguments.length+1);
	args[0] = 'OBJECT';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.persist = function(key){
	return this._run('PERSIST',key);
}

redis.pexpire = function(key,milliseconds){
	return this._run('PEXPIRE',key,milliseconds);
}

redis.pexpireat = function(key,milliseconds){
	return this._run('PEXPIREAT',key,milliseconds);
}

redis.ping = function(){
	return this._run('PING');
}

redis.psetex = function(key,milliseconds,value){
	return this._run('PSETEX',key,milliseconds,value);
}

redis.pttl = function(key){
	return this._run('PTTL',key);
}

redis.randomkey = function(){
	return this._run('RANDOMKEY');
}

redis.rename = function(key,newkey){
	return this._run('RENAME',key,newkey);
}

redis.renamenx = function(key,newkey){
	return this._run('RENAMENX',key,newkey);
}

// RESTORE key ttl serialized-value
redis.restore = function(key,ttl,serialized_value){
	redis.last_error = 'cant handle binary data, not implemented yet';
	return false;
}

redis.rpop = function(key){
	return this._run('RPOP',key);
}

redis.rpoplpush = function(source,destination){
	return this._run('RPOPLPUSH',source,destination);
}

redis.rpush = function(key,value){
	if(arguments.length==2){
		return this._run('RPUSH',key,value);
	}
	var args = Array(arguments.length+1);
	args[0] = 'RPUSH';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.rpushx = function(key,value){
	return this._run('RPUSHX',key,value);
}

redis.sadd = function(key,member){
	if(arguments.length==2){
		return this._run('SADD',key,value);
	}
	var args = Array(arguments.length+1);
	args[0] = 'SADD';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.save = function(){
	return this._run('SAVE');
}

redis.scard = function(key){
	return this._run('SCARD',key);
}

redis.script_exists = function(script){
	if(arguments.length==1){
		return this._run('SCRIPT','EXISTS',script);
	}
	var args = Array(arguments.length+2);
	args[0] = 'SCRIPT';
	args[1] = 'EXISTS';
	for(var i=0;i<arguments.length;i++)
		args[i+2] = arguments[i];
	return this._run.apply(this,args);
}

redis.script_flush = function(){
	return this._run('SCRIPT','FLUSH');
}

redis.script_kill = function(){
	return this._run('SCRIPT','KILL');
}

redis.script_load = function(script){
	return this._run('SCRIPT','LOAD',script);
}

redis.sdiff = function(key){
	if(arguments.length==1){
		return this._run('SDIFF',key);
	}
	var args = Array(arguments.length+1);
	args[0] = 'SDIFF';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.sdiffstore = function(destination,key){
	if(arguments.length==2){
		return this._run('SDIFFSTORE',destination,key);
	}
	var args = Array(arguments.length+1);
	args[0] = 'SDIFFSTORE';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.select = function(index){
	return this._run('SELECT',index);
}

redis._set = function(key,value){
	if(arguments.length>2){
		var args = Array(arguments.length+1);
		args[0] = 'SET';
		for(var i=0;i<arguments.length;i++)
			args[i+1] = arguments[i];
		return this._run.apply(this,args);
	}
	redis._runcounter++;
	redis.last_error = '';
	redis.str = redis.__run('SET',key,value);
	if(redis.str===false){
		redis.last_error = redis.getLastError();
	}
	return redis.str;
}
// SET key value [EX seconds] [PX milliseconds] [NX|XX]
redis.set = function(key,value){
	if(arguments.length>2 || typeof key != 'string' || typeof value != 'string')
		return this._set.apply(this,arguments);
	redis._runcounter++;
	redis.last_error = '';
	return this.__set(key,value);
}

redis.setbit = function(key,offset,value){
	return this._run('SETBIT',key,offset,value);
}

redis.setex = function(key,expire,value){
	return this._run('SETEX',key,expire,value);
}

redis.setnx = function(key,value){
	return this._run('SETNX',key,value);
}

redis.setrange = function(key,offset,value){
	return this._run('SETRANGE',key,offset,value);
}

redis.shutdown = function(){
	if(arguments.length==1){
		return this._run('SHUTDOWN');
	}
	var args = Array(arguments.length+1);
	args[0] = 'SHUTDOWN';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.sinter = function(key){
	if(arguments.length==1){
		return this._run('SINTER',key);
	}
	var args = Array(arguments.length+1);
	args[0] = 'SINTER';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.sinterstore = function(destination,key){
	if(arguments.length==2){
		return this._run('SINTERSTORE',destination,key);
	}
	var args = Array(arguments.length+1);
	args[0] = 'SINTERSTORE';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.sismember = function(key,member){
	return this._run('SISMEMBER',key,member);
}

redis.slowlog = function(subcommand){
	if(arguments.length==1){
		return this._run('SLOWLOG',subcommand);
	}
	var args = Array(arguments.length+1);
	args[0] = 'SLOWLOG';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.smembers = function(key){
	return this._run('SMEMBERS',key);
}

redis.smove = function(source,destination,member){
	return this._run('SMOVE',source,destination,member);
}

redis.sort = function(key){
	if(arguments.length==1){
		return this._run('SORT',key);
	}
	var args = Array(arguments.length+1);
	args[0] = 'SORT';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.spop = function(key){
	return this._run('SPOP',key);
}

redis.srandmember = function(key,count){
	if(argument.length==1)
		return this._run('SRANDMEMBER',key);
	return this._run('SRANDMEMBER',key,count);
}

redis.srem = function(key,member){
	if(arguments.length==2){
		return this._run('SREM',key,value);
	}
	var args = Array(arguments.length+1);
	args[0] = 'SREM';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.strlen = function(key){
	return this._run('STRLEN',key);
}

redis.sunion = function(key){
	if(arguments.length==1){
		return this._run('SUNION',key);
	}
	var args = Array(arguments.length+1);
	args[0] = 'SUNION';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.sunionstore = function(destination,key){
	if(arguments.length==2){
		return this._run('SUNIONSTORE',destination,key);
	}
	var args = Array(arguments.length+1);
	args[0] = 'SUNIONSTORE';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.sync = function(){
	return this._run('SYNC');
}

redis.time = function(){
	return this._run('TIME');
}

redis.ttl = function(key){
	return this._run('TTL',key);
}

redis.type = function(key){
	return this._run('TYPE',key);
}

redis.zadd = function(key,score,value){
	if(arguments.length>2){
		var args = Array(arguments.length+1);
		args[0] = 'ZADD';
		for(var i=0;i<arguments.length;i++)
			args[i+1] = arguments[i];
		return this._run.apply(this,args);
	}
	return this._run('ZADD',key,score,value);
}

redis.zcard = function(key){
	return this._run('ZCARD',key);
}

redis.zcount = function(key,min,max){
	return this._run('ZCOUNT',key,min,max);
}

redis.zincrby = function(key,increment,member){
	return this._run('ZINCRBY',key,increment,member);
}

redis.zinterstore = function(destination,numkeys,key){
	if(arguments.length==3){
		return this._run('ZINTERSTORE',destination,numkeys,key);
	}
	var args = Array(arguments.length+1);
	args[0] = 'ZUNIONSTORE';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.zrange = function(key,start,stop,withscores){
	if(arguments.length==4)
		return this._run('ZRANGE',key,start,stop,'WITHSCORES');
	return this._run('ZRANGE',key,start,stop);
}

redis.zrangebyscore = function(key,min,max){
	if(arguments.length==3){
		return this._run('ZRANGEBYSCORE',key,min,max);
	}
	var args = Array(arguments.length+1);
	args[0] = 'ZRANGEBYSCORE';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.zrank = function(key,member){
	return this._run('ZRANK',key,member);
}

redis.zrem = function(key,value){
	if(arguments.length>2){
		var args = Array(arguments.length+1);
		args[0] = 'ZREM';
		for(var i=0;i<arguments.length;i++)
			args[i+1] = arguments[i];
		return this._run.apply(this,args);
	}
	return this._run('ZREM',key,value);
}

redis.zremrangebyrank = function(key,start,stop){
	return this._run('ZREMRANGEBYRANK',key,start,stop);
}

redis.zremrangebyscore = function(key,min,max){
	return this._run('ZREMRANGEBYSCORE',key,min,max);
}

redis.zrevrange = function(key,start,stop,withscores){
	if(typeof withscores != 'undefined')
		return this._run('ZREVRANGE',key,start,stop,'WITHSCORES');
	return this._run('ZREVRANGE',key,start,stop);
}

redis.zrevrangebyscore = function(key,min,max){
	if(arguments.length==3){
		return this._run('ZREVRANGEBYSCORE',key,min,max);
	}
	var args = Array(arguments.length+1);
	args[0] = 'ZREVRANGEBYSCORE';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

redis.zrevrank = function(key,member){
	return this._run('ZREVRANK',key,member);
}

redis.zscore = function(key,member){
	return this._run('ZSCORE',key,member);
}

redis.zunionstore = function(destination,numkeys,key){
	if(arguments.length==3){
		return this._run('ZUNIONSTORE',destination,numkeys,key);
	}
	var args = Array(arguments.length+1);
	args[0] = 'ZUNIONSTORE';
	for(var i=0;i<arguments.length;i++)
		args[i+1] = arguments[i];
	return this._run.apply(this,args);
}

/* Redis Log levels
#define REDIS_DEBUG 0
#define REDIS_VERBOSE 1
#define REDIS_NOTICE 2
#define REDIS_WARNING 3
*/
console = {
	pretifyJSON: function(obj){
		if(typeof obj == 'string') return obj;
		if(typeof obj == 'number') return obj;
		return JSON.stringify(obj,null,'\t');
	},
	debug: function(){
		for(var i=0; i<arguments.length; i++)
			redis.__log(0,'console.debug argument['+i+'] = ' + console.pretifyJSON(arguments[i]));
	},
	info: function(){
		for(var i=0; i<arguments.length; i++)
			redis.__log(1,'console.info argument['+i+'] = ' + console.pretifyJSON(arguments[i]));
	},
	log: function(){
		for(var i=0; i<arguments.length; i++)
			redis.__log(2,'console.log argument['+i+'] = ' + console.pretifyJSON(arguments[i]));
	},
	warn: function(){
		for(var i=0; i<arguments.length; i++)
			redis.__log(3,'console.warn argument['+i+'] = ' + console.pretifyJSON(arguments[i]));
	}
};

redis.benchmark = {
	get: function(key){
		return redis.__get(key);
	},
	get100: function(key){
		var loop = 100;
		var rez = Array(100);
		while(--loop >= 0){
			rez[loop] = redis.__get(key);
		}
		return rez;
	},
	get300: function(key){
		var loop = 300;
		var rez = Array(300);
		while(--loop >= 0){
			rez[loop] = redis.__get(key);
		}
		return rez;
	},
	set: function(key,value){
		return redis.__set(key,value);
	},
	set100: function(key,value){
		var loop = 100;
		var rez = Array(100);
		while(--loop >= 0){
			rez[loop] = redis.__set(key,value);
		}
		return rez;
	},
	set300: function(key,value){
		var loop = 300;
		var rez = Array(300);
		while(--loop >= 0){
			rez[loop] = redis.__set(key,value);
		}
		return rez;
	},
	incr: function(key){
		return redis.__incrby(key,1);
	},
	incr100: function(key){
		var loop = 100;
		var rez = Array(100);
		while(--loop >= 0){
			rez[loop] = redis.__incrby(key,1);
		}
		return rez;
	},
	incr300: function(key){
		var loop = 300;
		var rez = Array(300);
		while(--loop >= 0){
			rez[loop] = redis.__incrby(key,1);
		}
		return rez;
	},
}

//helpers
function date (format, timestamp) {
	// http://kevin.vanzonneveld.net
	// +	 original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
	// +			parts by: Peter-Paul Koch (http://www.quirksmode.org/js/beat.html)
	// +	 improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +	 improved by: MeEtc (http://yass.meetcweb.com)
	// +	 improved by: Brad Touesnard
	// +	 improved by: Tim Wiel
	// +	 improved by: Bryan Elliott
	//
	// +	 improved by: Brett Zamir (http://brett-zamir.me)
	// +	 improved by: David Randall
	// +			input by: Brett Zamir (http://brett-zamir.me)
	// +	 bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +	 improved by: Brett Zamir (http://brett-zamir.me)
	// +	 improved by: Brett Zamir (http://brett-zamir.me)
	// +	 improved by: Theriault
	// +	derived from: gettimeofday
	// +			input by: majak
	// +	 bugfixed by: majak
	// +	 bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +			input by: Alex
	// +	 bugfixed by: Brett Zamir (http://brett-zamir.me)
	// +	 improved by: Theriault
	// +	 improved by: Brett Zamir (http://brett-zamir.me)
	// +	 improved by: Theriault
	// +	 improved by: Thomas Beaucourt (http://www.webapp.fr)
	// +	 improved by: JT
	// +	 improved by: Theriault
	// +	 improved by: Rafał Kukawski (http://blog.kukawski.pl)
	// +	 bugfixed by: omid (http://phpjs.org/functions/380:380#comment_137122)
	// +			input by: Martin
	// +			input by: Alex Wilson
	// +	 bugfixed by: Chris (http://www.devotis.nl/)
	// %				note 1: Uses global: php_js to store the default timezone
	// %				note 2: Although the function potentially allows timezone info (see notes), it currently does not set
	// %				note 2: per a timezone specified by date_default_timezone_set(). Implementers might use
	// %				note 2: this.php_js.currentTimezoneOffset and this.php_js.currentTimezoneDST set by that function
	// %				note 2: in order to adjust the dates in this function (or our other date functions!) accordingly
	// *		 example 1: date('H:m:s \\m \\i\\s \\m\\o\\n\\t\\h', 1062402400);
	// *		 returns 1: '09:09:40 m is month'
	// *		 example 2: date('F j, Y, g:i a', 1062462400);
	// *		 returns 2: 'September 2, 2003, 2:26 am'
	// *		 example 3: date('Y W o', 1062462400);
	// *		 returns 3: '2003 36 2003'
	// *		 example 4: x = date('Y m d', (new Date()).getTime()/1000);
	// *		 example 4: (x+'').length == 10 // 2009 01 09
	// *		 returns 4: true
	// *		 example 5: date('W', 1104534000);
	// *		 returns 5: '53'
	// *		 example 6: date('B t', 1104534000);
	// *		 returns 6: '999 31'
	// *		 example 7: date('W U', 1293750000.82); // 2010-12-31
	// *		 returns 7: '52 1293750000'
	// *		 example 8: date('W', 1293836400); // 2011-01-01
	// *		 returns 8: '52'
	// *		 example 9: date('W Y-m-d', 1293974054); // 2011-01-02
	// *		 returns 9: '52 2011-01-02'
		var that = this,
			jsdate,
			f,
			formatChr = /\\?([a-z])/gi,
			formatChrCb,
			// Keep this here (works, but for code commented-out
			// below for file size reasons)
			//, tal= [],
			_pad = function (n, c) {
				n = n.toString();
				return n.length < c ? _pad('0' + n, c, '0') : n;
			},
			txt_words = ["Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	formatChrCb = function (t, s) {
		return f[t] ? f[t]() : s;
	};
	f = {
		// Day
		d: function () { // Day of month w/leading 0; 01..31
			return _pad(f.j(), 2);
		},
		D: function () { // Shorthand day name; Mon...Sun
			return f.l().slice(0, 3);
		},
		j: function () { // Day of month; 1..31
			return jsdate.getDate();
		},
		l: function () { // Full day name; Monday...Sunday
			return txt_words[f.w()] + 'day';
		},
		N: function () { // ISO-8601 day of week; 1[Mon]..7[Sun]
			return f.w() || 7;
		},
		S: function(){ // Ordinal suffix for day of month; st, nd, rd, th
			var j = f.j()
			i = j%10;
			if (i <= 3 && parseInt((j%100)/10) == 1) i = 0;
			return ['st', 'nd', 'rd'][i - 1] || 'th';
		},
		w: function () { // Day of week; 0[Sun]..6[Sat]
			return jsdate.getDay();
		},
		z: function () { // Day of year; 0..365
			var a = new Date(f.Y(), f.n() - 1, f.j()),
				b = new Date(f.Y(), 0, 1);
			return Math.round((a - b) / 864e5);
		},

		// Week
		W: function () { // ISO-8601 week number
			var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3),
				b = new Date(a.getFullYear(), 0, 4);
			return _pad(1 + Math.round((a - b) / 864e5 / 7), 2);
		},

		// Month
		F: function () { // Full month name; January...December
			return txt_words[6 + f.n()];
		},
		m: function () { // Month w/leading 0; 01...12
			return _pad(f.n(), 2);
		},
		M: function () { // Shorthand month name; Jan...Dec
			return f.F().slice(0, 3);
		},
		n: function () { // Month; 1...12
			return jsdate.getMonth() + 1;
		},
		t: function () { // Days in month; 28...31
			return (new Date(f.Y(), f.n(), 0)).getDate();
		},

		// Year
		L: function () { // Is leap year?; 0 or 1
			var j = f.Y();
			return j % 4 === 0 & j % 100 !== 0 | j % 400 === 0;
		},
		o: function () { // ISO-8601 year
			var n = f.n(),
				W = f.W(),
				Y = f.Y();
			return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0);
		},
		Y: function () { // Full year; e.g. 1980...2010
			return jsdate.getFullYear();
		},
		y: function () { // Last two digits of year; 00...99
			return f.Y().toString().slice(-2);
		},

		// Time
		a: function () { // am or pm
			return jsdate.getHours() > 11 ? "pm" : "am";
		},
		A: function () { // AM or PM
			return f.a().toUpperCase();
		},
		B: function () { // Swatch Internet time; 000..999
			var H = jsdate.getUTCHours() * 36e2,
				// Hours
				i = jsdate.getUTCMinutes() * 60,
				// Minutes
				s = jsdate.getUTCSeconds(); // Seconds
			return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3);
		},
		g: function () { // 12-Hours; 1..12
			return f.G() % 12 || 12;
		},
		G: function () { // 24-Hours; 0..23
			return jsdate.getHours();
		},
		h: function () { // 12-Hours w/leading 0; 01..12
			return _pad(f.g(), 2);
		},
		H: function () { // 24-Hours w/leading 0; 00..23
			return _pad(f.G(), 2);
		},
		i: function () { // Minutes w/leading 0; 00..59
			return _pad(jsdate.getMinutes(), 2);
		},
		s: function () { // Seconds w/leading 0; 00..59
			return _pad(jsdate.getSeconds(), 2);
		},
		u: function () { // Microseconds; 000000-999000
			return _pad(jsdate.getMilliseconds() * 1000, 6);
		},

		// Timezone
		e: function () { // Timezone identifier; e.g. Atlantic/Azores, ...
			// The following works, but requires inclusion of the very large
			// timezone_abbreviations_list() function.
/*							return that.date_default_timezone_get();
*/
			throw 'Not supported (see source code of date() for timezone on how to add support)';
		},
		I: function () { // DST observed?; 0 or 1
			// Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
			// If they are not equal, then DST is observed.
			var a = new Date(f.Y(), 0),
				// Jan 1
				c = Date.UTC(f.Y(), 0),
				// Jan 1 UTC
				b = new Date(f.Y(), 6),
				// Jul 1
				d = Date.UTC(f.Y(), 6); // Jul 1 UTC
			return ((a - c) !== (b - d)) ? 1 : 0;
		},
		O: function () { // Difference to GMT in hour format; e.g. +0200
			var tzo = jsdate.getTimezoneOffset(),
				a = Math.abs(tzo);
			return (tzo > 0 ? "-" : "+") + _pad(Math.floor(a / 60) * 100 + a % 60, 4);
		},
		P: function () { // Difference to GMT w/colon; e.g. +02:00
			var O = f.O();
			return (O.substr(0, 3) + ":" + O.substr(3, 2));
		},
		T: function () { // Timezone abbreviation; e.g. EST, MDT, ...
			// The following works, but requires inclusion of the very
			// large timezone_abbreviations_list() function.
/*							var abbr = '', i = 0, os = 0, default = 0;
			if (!tal.length) {
				tal = that.timezone_abbreviations_list();
			}
			if (that.php_js && that.php_js.default_timezone) {
				default = that.php_js.default_timezone;
				for (abbr in tal) {
					for (i=0; i < tal[abbr].length; i++) {
						if (tal[abbr][i].timezone_id === default) {
							return abbr.toUpperCase();
						}
					}
				}
			}
			for (abbr in tal) {
				for (i = 0; i < tal[abbr].length; i++) {
					os = -jsdate.getTimezoneOffset() * 60;
					if (tal[abbr][i].offset === os) {
						return abbr.toUpperCase();
					}
				}
			}
*/
			return 'UTC';
		},
		Z: function () { // Timezone offset in seconds (-43200...50400)
			return -jsdate.getTimezoneOffset() * 60;
		},

		// Full Date/Time
		c: function () { // ISO-8601 date.
			return 'Y-m-d\\TH:i:sP'.replace(formatChr, formatChrCb);
		},
		r: function () { // RFC 2822
			return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb);
		},
		U: function () { // Seconds since UNIX epoch
			return jsdate / 1000 | 0;
		}
	};
	this.date = function (format, timestamp) {
		that = this;
		jsdate = (timestamp === undefined ? new Date() : // Not provided
			(timestamp instanceof Date) ? new Date(timestamp) : // JS Date()
			new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
		);
		return format.replace(formatChr, formatChrCb);
	};
	return this.date(format, timestamp);
}

Crypto = {};

(function(){
	//MD5
	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	var CryptoJS=CryptoJS||function(s,p){var m={},l=m.lib={},n=function(){},r=l.Base={extend:function(b){n.prototype=this;var h=new n;b&&h.mixIn(b);h.hasOwnProperty("init")||(h.init=function(){h.$super.init.apply(this,arguments)});h.init.prototype=h;h.$super=this;return h},create:function(){var b=this.extend();b.init.apply(b,arguments);return b},init:function(){},mixIn:function(b){for(var h in b)b.hasOwnProperty(h)&&(this[h]=b[h]);b.hasOwnProperty("toString")&&(this.toString=b.toString)},clone:function(){return this.init.prototype.extend(this)}},
	q=l.WordArray=r.extend({init:function(b,h){b=this.words=b||[];this.sigBytes=h!=p?h:4*b.length},toString:function(b){return(b||t).stringify(this)},concat:function(b){var h=this.words,a=b.words,j=this.sigBytes;b=b.sigBytes;this.clamp();if(j%4)for(var g=0;g<b;g++)h[j+g>>>2]|=(a[g>>>2]>>>24-8*(g%4)&255)<<24-8*((j+g)%4);else if(65535<a.length)for(g=0;g<b;g+=4)h[j+g>>>2]=a[g>>>2];else h.push.apply(h,a);this.sigBytes+=b;return this},clamp:function(){var b=this.words,h=this.sigBytes;b[h>>>2]&=4294967295<<
	32-8*(h%4);b.length=s.ceil(h/4)},clone:function(){var b=r.clone.call(this);b.words=this.words.slice(0);return b},random:function(b){for(var h=[],a=0;a<b;a+=4)h.push(4294967296*s.random()|0);return new q.init(h,b)}}),v=m.enc={},t=v.Hex={stringify:function(b){var a=b.words;b=b.sigBytes;for(var g=[],j=0;j<b;j++){var k=a[j>>>2]>>>24-8*(j%4)&255;g.push((k>>>4).toString(16));g.push((k&15).toString(16))}return g.join("")},parse:function(b){for(var a=b.length,g=[],j=0;j<a;j+=2)g[j>>>3]|=parseInt(b.substr(j,
	2),16)<<24-4*(j%8);return new q.init(g,a/2)}},a=v.Latin1={stringify:function(b){var a=b.words;b=b.sigBytes;for(var g=[],j=0;j<b;j++)g.push(String.fromCharCode(a[j>>>2]>>>24-8*(j%4)&255));return g.join("")},parse:function(b){for(var a=b.length,g=[],j=0;j<a;j++)g[j>>>2]|=(b.charCodeAt(j)&255)<<24-8*(j%4);return new q.init(g,a)}},u=v.Utf8={stringify:function(b){try{return decodeURIComponent(escape(a.stringify(b)))}catch(g){throw Error("Malformed UTF-8 data");}},parse:function(b){return a.parse(unescape(encodeURIComponent(b)))}},
	g=l.BufferedBlockAlgorithm=r.extend({reset:function(){this._data=new q.init;this._nDataBytes=0},_append:function(b){"string"==typeof b&&(b=u.parse(b));this._data.concat(b);this._nDataBytes+=b.sigBytes},_process:function(b){var a=this._data,g=a.words,j=a.sigBytes,k=this.blockSize,m=j/(4*k),m=b?s.ceil(m):s.max((m|0)-this._minBufferSize,0);b=m*k;j=s.min(4*b,j);if(b){for(var l=0;l<b;l+=k)this._doProcessBlock(g,l);l=g.splice(0,b);a.sigBytes-=j}return new q.init(l,j)},clone:function(){var b=r.clone.call(this);
	b._data=this._data.clone();return b},_minBufferSize:0});l.Hasher=g.extend({cfg:r.extend(),init:function(b){this.cfg=this.cfg.extend(b);this.reset()},reset:function(){g.reset.call(this);this._doReset()},update:function(b){this._append(b);this._process();return this},finalize:function(b){b&&this._append(b);return this._doFinalize()},blockSize:16,_createHelper:function(b){return function(a,g){return(new b.init(g)).finalize(a)}},_createHmacHelper:function(b){return function(a,g){return(new k.HMAC.init(b,
	g)).finalize(a)}}});var k=m.algo={};return m}(Math);
	(function(s){function p(a,k,b,h,l,j,m){a=a+(k&b|~k&h)+l+m;return(a<<j|a>>>32-j)+k}function m(a,k,b,h,l,j,m){a=a+(k&h|b&~h)+l+m;return(a<<j|a>>>32-j)+k}function l(a,k,b,h,l,j,m){a=a+(k^b^h)+l+m;return(a<<j|a>>>32-j)+k}function n(a,k,b,h,l,j,m){a=a+(b^(k|~h))+l+m;return(a<<j|a>>>32-j)+k}for(var r=CryptoJS,q=r.lib,v=q.WordArray,t=q.Hasher,q=r.algo,a=[],u=0;64>u;u++)a[u]=4294967296*s.abs(s.sin(u+1))|0;q=q.MD5=t.extend({_doReset:function(){this._hash=new v.init([1732584193,4023233417,2562383102,271733878])},
	_doProcessBlock:function(g,k){for(var b=0;16>b;b++){var h=k+b,w=g[h];g[h]=(w<<8|w>>>24)&16711935|(w<<24|w>>>8)&4278255360}var b=this._hash.words,h=g[k+0],w=g[k+1],j=g[k+2],q=g[k+3],r=g[k+4],s=g[k+5],t=g[k+6],u=g[k+7],v=g[k+8],x=g[k+9],y=g[k+10],z=g[k+11],A=g[k+12],B=g[k+13],C=g[k+14],D=g[k+15],c=b[0],d=b[1],e=b[2],f=b[3],c=p(c,d,e,f,h,7,a[0]),f=p(f,c,d,e,w,12,a[1]),e=p(e,f,c,d,j,17,a[2]),d=p(d,e,f,c,q,22,a[3]),c=p(c,d,e,f,r,7,a[4]),f=p(f,c,d,e,s,12,a[5]),e=p(e,f,c,d,t,17,a[6]),d=p(d,e,f,c,u,22,a[7]),
	c=p(c,d,e,f,v,7,a[8]),f=p(f,c,d,e,x,12,a[9]),e=p(e,f,c,d,y,17,a[10]),d=p(d,e,f,c,z,22,a[11]),c=p(c,d,e,f,A,7,a[12]),f=p(f,c,d,e,B,12,a[13]),e=p(e,f,c,d,C,17,a[14]),d=p(d,e,f,c,D,22,a[15]),c=m(c,d,e,f,w,5,a[16]),f=m(f,c,d,e,t,9,a[17]),e=m(e,f,c,d,z,14,a[18]),d=m(d,e,f,c,h,20,a[19]),c=m(c,d,e,f,s,5,a[20]),f=m(f,c,d,e,y,9,a[21]),e=m(e,f,c,d,D,14,a[22]),d=m(d,e,f,c,r,20,a[23]),c=m(c,d,e,f,x,5,a[24]),f=m(f,c,d,e,C,9,a[25]),e=m(e,f,c,d,q,14,a[26]),d=m(d,e,f,c,v,20,a[27]),c=m(c,d,e,f,B,5,a[28]),f=m(f,c,
	d,e,j,9,a[29]),e=m(e,f,c,d,u,14,a[30]),d=m(d,e,f,c,A,20,a[31]),c=l(c,d,e,f,s,4,a[32]),f=l(f,c,d,e,v,11,a[33]),e=l(e,f,c,d,z,16,a[34]),d=l(d,e,f,c,C,23,a[35]),c=l(c,d,e,f,w,4,a[36]),f=l(f,c,d,e,r,11,a[37]),e=l(e,f,c,d,u,16,a[38]),d=l(d,e,f,c,y,23,a[39]),c=l(c,d,e,f,B,4,a[40]),f=l(f,c,d,e,h,11,a[41]),e=l(e,f,c,d,q,16,a[42]),d=l(d,e,f,c,t,23,a[43]),c=l(c,d,e,f,x,4,a[44]),f=l(f,c,d,e,A,11,a[45]),e=l(e,f,c,d,D,16,a[46]),d=l(d,e,f,c,j,23,a[47]),c=n(c,d,e,f,h,6,a[48]),f=n(f,c,d,e,u,10,a[49]),e=n(e,f,c,d,
	C,15,a[50]),d=n(d,e,f,c,s,21,a[51]),c=n(c,d,e,f,A,6,a[52]),f=n(f,c,d,e,q,10,a[53]),e=n(e,f,c,d,y,15,a[54]),d=n(d,e,f,c,w,21,a[55]),c=n(c,d,e,f,v,6,a[56]),f=n(f,c,d,e,D,10,a[57]),e=n(e,f,c,d,t,15,a[58]),d=n(d,e,f,c,B,21,a[59]),c=n(c,d,e,f,r,6,a[60]),f=n(f,c,d,e,z,10,a[61]),e=n(e,f,c,d,j,15,a[62]),d=n(d,e,f,c,x,21,a[63]);b[0]=b[0]+c|0;b[1]=b[1]+d|0;b[2]=b[2]+e|0;b[3]=b[3]+f|0},_doFinalize:function(){var a=this._data,k=a.words,b=8*this._nDataBytes,h=8*a.sigBytes;k[h>>>5]|=128<<24-h%32;var l=s.floor(b/
	4294967296);k[(h+64>>>9<<4)+15]=(l<<8|l>>>24)&16711935|(l<<24|l>>>8)&4278255360;k[(h+64>>>9<<4)+14]=(b<<8|b>>>24)&16711935|(b<<24|b>>>8)&4278255360;a.sigBytes=4*(k.length+1);this._process();a=this._hash;k=a.words;for(b=0;4>b;b++)h=k[b],k[b]=(h<<8|h>>>24)&16711935|(h<<24|h>>>8)&4278255360;return a},clone:function(){var a=t.clone.call(this);a._hash=this._hash.clone();return a}});r.MD5=t._createHelper(q);r.HmacMD5=t._createHmacHelper(q)})(Math);
	
	Crypto.md5 = function(str){
		return CryptoJS.MD5(str).toString();
	}
})();
//