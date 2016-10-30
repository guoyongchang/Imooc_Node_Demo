var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;

var UserSchema = new mongoose.Schema({
	name:{
		unique:true,
		type:String
	},
	password:String,
	//默认:0 normal
	//1 校验后用户
	//2 用户
	//>10 管理员
	//>50 超级管理员
	role: {
		type:Number,
		default:0
	},
	meta:{
		createAt:{
			type:Date,
			default:Date.now()
		},
		updateAt:{
			type:Date,
			default:Date.now()
		}
	}
});

UserSchema.pre('save',function(next){
	var user = this;
	//console.log("password:"+user.password);
	if(this.isNew){
		this.meta.createAt =this.meta.updateAt=Date.now();
	}else{
		this.meta.updateAt = Date.now();
	}

	bcrypt.genSalt(SALT_WORK_FACTOR,function function_name (err,salt) {
		if(err)
			return next(err);
		bcrypt.hash(user.password,salt,function(err,hash){
			if(err) 
				return next(err);
			user.password = hash;
			next();
		});
	})

});

UserSchema.methods={
	comparePassword:function(_password,cb) {
		bcrypt.compare(_password,this.password,function(err,isMatch){
			if(err)
				return cb(err);
			cb(null,isMatch);
		});
	}
}

UserSchema.statics = {
	fetch:function(cb){
		return this
			.find({})
			.sort('meta.updateAt')
			.exec(cb);
	},
	findById:function(id,cb){
		return this
			.findOne({_id:id})
			.exec(cb);
	},
	delete:function(id,cb){
		console.log(id+"Delete");
		return this
			.findOne({_id:id})
			.remove();
	}
}

module.exports = UserSchema;