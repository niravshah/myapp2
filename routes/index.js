var superagent = require('superagent');

exports.index = function(req, res){
  res.render('index');
};

exports.jobs = function(req, res){
  res.render('hello.html');
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
        response.render('job',args);
    })
};