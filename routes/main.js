var superagent = require('superagent');
var cc = require('coupon-code');


exports.recruit = function(req, res){
  res.render('recruit');
};

exports.reward = function(req, res){
  res.render('reward');
};

exports.upload = function(req, response){
 console.log(req.files);
};

exports.cc = function(req, response){
    
    var parms = req.query.parms;
    var resp = {}
    for(var parm in parms){
        var a = [];
        for(i=0;i<parms[parm];i++){
            var code = cc.generate({parts:3,partLen:4,});
            a.push(code);
        }
        resp[parm] = a;
    }
    response.send(resp);
};


exports.job = function(req, response){
    var jobid = req.params['jobid'];
    var json = null;
  superagent
    .get('https://api.parse.com/1/classes/job')
    .set('X-Parse-Application-Id','1VLvUdvqRdm6AUlXbQRL2MbWERa65hMccF9GWzpG')
    .set('X-Parse-REST-API-Key','K3uloUR0JnYSZBoWp2b70eE31Erh2mT2KZdQK7yf')
    .set('Accept', 'application/json')
    .query({where:'{"jobId":'+jobid+'}'})
    .end(function(e,res){
        var fullURL = req.protocol + "://refrew.kd.io" + req.url;
        json = JSON.parse(res.text);
        var result = json['results'][0];
        var args = {};
        args['location'] = result.location;
        args['skills'] = result.skills;
        args['title'] = result.eventName;
        args['description'] = result.description;
        args['eventName'] = result.eventName;
        args['eventUrl'] = result.eventUrl;
        args['fullURL'] = fullURL;
        args['jobid'] = jobid;
        args['creatorFirstName']=result.creatorFirstName;
        args['creatorLastName']=result.creatorLastName;
        args['creatorId']=result.creatorId;
        args['creatorUrl']=result.creatorUrl;
        args['creatorPictureUrl']=result.creatorPictureUrl;
        response.render('refer',args);
    })
};