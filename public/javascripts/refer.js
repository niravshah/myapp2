$(function () {


    Mod.LinkedInSearchResultModel = Backbone.Model.extend({
        initialize: function () {
            this.job = this.attributes['job'];
        },
        url: function () {
            return '/jobs/' + this.get('job') + '/referrals'
        },
        defaults: {
            name: '',
            url: '',
            user: '',
            job: '',
            referenceName: ''
        }
    });

    Mod.LinkedInSearchResultCollection = Backbone.Collection.extend({
        model: Mod.LinkedInSearchResultModel
    });

    Mod.LinkedInSearchResultView = Backbone.Marionette.ItemView.extend({
        model: Mod.LinkedInSearchResultModel,
        template: '#lisearch-item-template',
        tagName: 'li',
        className: 'list-group-item',
        events: {
            'click button.js-submit': 'selectReference'
        },
        selectReference: function (evt) {
            var data = Backbone.Syphon.serialize(this);
            var model = new Mod.LinkedInSearchResultModel(data);
            var referralSubmitForm = new Viewer.ReferralsModule.Views.ReferralSubmitFormView({
                model: model
            });
            App.content.currentLayout.lr4c2.show(referralSubmitForm);
            App.content.currentLayout.lr4c2.$el.show();
            $('.selected').removeClass('selected');
            $(evt.target.parentElement).addClass('selected');
        }
    });

    Mod.LinkedInSearchResultCollectionView = Backbone.Marionette.CollectionView.extend({
        itemView: Mod.LinkedInSearchResultView,
        tagName: 'ul',
        className: 'list-group alt',
        initialize: function (options) {
            var _this = this;
            _.bindAll(this, "render");
            _this.render();
        }
    });
    
    
    Mod.SelectedReferralView = Backbone.Marionette.ItemView.extend({
        model: Mod.LinkedInSearchResultModel,
        template: '#selected-user-referral',
        events: {
            'click #save-referral': 'save'
        }
    });

    Mod.ReferralView = Backbone.Marionette.ItemView.extend({
        model: Mod.LinkedInSearchResultModel,
        template: '#submit-referral-form',
        events: {
            'click #save-referral': 'save'
        },
        save: function () {
            
            $('#save-referral').addClass('disabled');
            var saveArr = {};
            
            saveArr['refererFirstName'] = $('#referer-first-name').val();
            saveArr['refererLastName'] = $('#referer-last-name').val();
            saveArr['refererId'] = $('#referer-id').val();
            saveArr['refererUrl'] = $('#referer-url').val();
            saveArr['refererPictureUrl'] = $('#referer-picture-url').val();
            saveArr['refererHeadline'] = $('#referer-headline').val();
            saveArr['refererCompany'] = $('#referer-company').val();
            
            saveArr['refreeFirstName'] = $('#selected-refree-first-name').val();
            saveArr['refreeLastName'] = $('#selected-refree-last-name').val();
            saveArr['refreeUrl'] = $('#refree-name').attr('href');
            saveArr['refreeLocation'] = $('#selected-refree-location').val();
            saveArr['refreeHeadline'] = $('#selected-refree-headline').val();
            saveArr['refreePictureUrl'] = $('#selected-refree-img').val();
            
            saveArr['refreeRel'] = $('#refree-rel').val();
            saveArr['refreeAbout'] = $('#refree-about').val();
            saveArr['jobid'] = $('#jobid').val();
            var Ref = Parse.Object.extend("referral");
            var referral = new Ref();
            referral.save(saveArr, {
                success: function (resp) {
                    console.log('Successful Parse Save:' + resp);
                    $('#save-referral').text('Saved Successfully!');
                    $('#save-referral').removeClass('btn-primary');
                    $('#save-referral').addClass('btn-success');
                    var jobid = $('#job-id').val();
                    var refrerId = $('#referer-id').val();
                    var Referral = Parse.Object.extend("referral");
                    var query = new Parse.Query(Referral);
                    query.equalTo("refererId", refrerId);
                    query.equalTo("jobid", jobid);
                    query.find({
                        success:function(results){
                            new Mod.Controller().displayUserSelectedReferral(results);
                        }
                    });
                    $('#li-selected-ref').hide();                    
                },
                error: function (resp) {
                    console.log('Error saving to Parse: ' + resp);
                }
            });
        }
    });
    
    Mod.AllReferrals = Backbone.View.extend({
        el: $('#all-referrals'),
        events: {
            "click .icon-check-empty": "displayDetails",
             "click .icon-check": "hideDetails"
        },
        displayDetails : function(e){
            $('.icon-check').addClass('icon-check-empty');
            $('.icon-check').removeClass('icon-check');
            $(e.target).removeClass('icon-check-empty');
            $(e.target).addClass('icon-check');
            var mB = $(e.target).parents('.media').children('.media-body');
            var args={};
            args['refrerFirstName'] = $(mB).children('#refrer-first-name').val();
            args['refrerLastName'] = $(mB).children('#refrer-last-name').val();
            args['refrerId'] = $(mB).children('#refrer-id').val();
            args['refrerUrl'] = $(mB).children('#refrer-url').val();
            args['refrerPictureUrl'] = $(mB).children('#refrer-picture-url').val();
            args['refrerHeadline'] = $(mB).children('#refrer-headline').val();
            args['refrerCompany'] = $(mB).children('#refrer-company').val();
            args['refreeAbout'] = $(mB).children('#refree-about').val();
            args['refreeRel'] = $(mB).children('#refree-rel').val();
            args['name'] = $(mB).children('div').children('#refree-full-name').html();
            args['url'] = $(mB).children('div').children('#refree-full-name').attr('href');
            var mod = new Mod.LinkedInSearchResultModel(args);
            var view = new Mod.SelectedReferralView({
                model: mod
            });
            $('#all-selected-ref').html(view.render().el);
        },
        hideDetails : function(e){
            $(e.target).removeClass('icon-check');
            $(e.target).addClass('icon-check-empty');
        }
     });
    
    Mod.UserReferrals = Backbone.View.extend({
        el: $('#user-referrals'),
        events: {
            "click .destroy": "deleteReference"
        },
        deleteReference: function(e){
            var objid = $(e.target).attr('data-objid');
            var referral = Parse.Object.extend("referral");
            var query = new Parse.Query(referral);
            query.get(objid, {
                success: function(myObj) {
                    myObj.destroy({});
                    var jobid = $('#job-id').val();
                    var refrerId = $('#referer-id').val();
                    var Referral = Parse.Object.extend("referral");
                    var query = new Parse.Query(Referral);
                    query.equalTo("refererId", refrerId);
                    query.equalTo("jobid", jobid);
                    query.find({
                        success:function(results){
                           new Mod.Controller().displayUserSelectedReferral(results);
                        }
                    });
                    
                },
                error: function(object, error) {
                    console.log('Could not retrieve Referral: ' + objid);
                }
            });            
        }
     });

    Mod.SaveView = Backbone.View.extend({
        el: $('#linkedin-search'),
        events: {
            "click #search-linkedin": "search",
            "click .pull-right .icon-circle": "clickPullRightIconCircle",
            "click .icon-check-minus": "deleteReference"
        },
        search: function (e) {
            console.log($('#search-keywords').val());
            new Mod.Controller().peopleSearch($('#search-keywords').val());
        },
        clickPullRightIconCircle: function (e) {
            $(".text-success").addClass("text-muted");
            $(".text-success").removeClass("text-success");
            $(e.target).removeClass("text-muted");
            $(e.target).addClass("text-success");
            var child = $(e.target).parents('.media').children('.media-body').children('div').children('a');
            var args = {};
            args['name'] = $(child).html();
            args['url'] = $(child).attr('href');
            var headline = $(e.target).parents('.media').children('.media-body').children('#refree-headline');
            args['headline'] = $(headline).html();
            var location = $(e.target).parents('.media').children('.media-body').children('#refree-location');
            args['location'] = $(location).html();
            var firstName = $(e.target).parents('.media').children('.media-body').children('#refree-first-name');
            args['firstName'] = $(firstName).val();
            var lastName = $(e.target).parents('.media').children('.media-body').children('#refree-last-name');
            args['lastName'] = $(lastName).val();
            var img = $(e.target).parents('.media').children('span').children('#refree-img');
            args['imgSrc'] = $(img).attr('src');
            var mod = new Mod.LinkedInSearchResultModel(args);
            var view = new Mod.ReferralView({
                model: mod
            });
            $('#li-selected-ref').html(view.render().el);
            $('#li-selected-ref').show();
        }
       
    });

    Mod.Controller = Backbone.Marionette.Controller.extend({
        peopleSearch: function (keywords) {
            IN.API.PeopleSearch()
                .fields("firstName", "lastName", "distance", 'positions', 'picture-url', 'headline', 'skills', 'location:(name)', "public-profile-url")
                .params({
                    "keywords": keywords,
                    "count": 10,
                    "sort": "distance"
                })
                .result(function (results) {
                    new Mod.Controller().displayPeopleSearch(results);
                })
                .error(function error(e) {
                    console.log('peopleSearch Error:', e);
                });
        },
        displayPeopleSearch: function (peopleSearch) {
            $('#linkedin-search').show();
            var members = peopleSearch.people.values;
            var liSearchArr = [];
            for (var member in members) {
                var distance = members[member].distance;
                switch (distance) {
                case 1:
                    var model = new Mod.LinkedInSearchResultModel(members[member]);
                    liSearchArr.push(model);
                    break;
                default:
                }
            }
            var liSearchCollection = new Mod.LinkedInSearchResultCollection(liSearchArr);
            var liSearchCollView = new Mod.LinkedInSearchResultCollectionView({
                collection: liSearchCollection
            });
            $('#li-search-results').html(liSearchCollView.render().el);
        },
        displayUserSelectedReferral : function(attributes){
            if(attributes.length > 0){
                $('#user-referrals').show();
                var liSearchArr = [];
                for(var runner in attributes){
                    var obj = attributes[runner];
                    var attr = obj.attributes;
                    var a = [];
                    a['id'] = obj.id;
                    a['firstName']= attr['refreeFirstName'];
                    a['lastName']= attr['refreeLastName'];
                    a['headline']= attr['refreeHeadline'];
                    a['pictureUrl'] = attr['refreePictureUrl'];
                    a['publicProfileUrl'] = attr['refreeUrl'];
                    var l =[];
                    l['name'] = attr['refreeLocation']
                    a['location'] = l;
                    var model = new Mod.LinkedInSearchResultModel(a);
                    liSearchArr.push(model);
                }
                var liSearchCollection = new Mod.LinkedInSearchResultCollection(liSearchArr);
                var liSearchCollView = new Mod.LinkedInSearchResultCollectionView({collection: liSearchCollection});
                $('#li-user-referrals').html(liSearchCollView.render().el);
            }
        },
        displayAllReferrals : function(attributes){
             if(attributes.length > 0){
                $('#all-referrals').show();
                var liSearchArr = [];
                for(var runner in attributes){
                    var obj = attributes[runner];
                    var attr = obj.attributes;
                    var a = [];
                    a['id'] = obj.id;
                    a['firstName']= attr['refreeFirstName'];
                    a['lastName']= attr['refreeLastName'];
                    a['headline']= attr['refreeHeadline'];
                    a['pictureUrl'] = attr['refreePictureUrl'];
                    a['publicProfileUrl'] = attr['refreeUrl'];
                    var l =[];
                    l['name'] = attr['refreeLocation']
                    a['location'] = l;
                    a['moreDetails'] = true;
                    a['refererFirstName']=attr['refererFirstName'];
                    a['refererLastName']=attr['refererLastName'];
                    a['refererId']=attr['refererId'];
                    a['refererUrl']=attr['refererUrl'];
                    a['refererPictureUrl']=attr['refererPictureUrl'];
                    a['refererHeadline']=attr['refererHeadline'];
                    a['refererCompany']=attr['refererCompany'];
                    a['refreeAbout']=attr['refreeAbout'];
                    a['refreeRel']=attr['refreeRel'];
                    var model = new Mod.LinkedInSearchResultModel(a);
                    liSearchArr.push(model);
                }
                var liSearchCollection = new Mod.LinkedInSearchResultCollection(liSearchArr);
                var liSearchCollView = new Mod.LinkedInSearchResultCollectionView({collection: liSearchCollection});
                $('#all-user-referrals').html(liSearchCollView.render().el);                
             }
        }
    });

    var AppRouter = Backbone.Router.extend({
        routes: {

        },
        initialize: function () {
            new Mod.SaveView();
            new Mod.UserReferrals();
            new Mod.AllReferrals();
            Parse.initialize("1VLvUdvqRdm6AUlXbQRL2MbWERa65hMccF9GWzpG", "Hq7DY9cxSYsR3gmV3r4iFv62d8bT0xiNaP8EdZFL");
        }

    });

    var app = new AppRouter();
    Backbone.history.start();

});