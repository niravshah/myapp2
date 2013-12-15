$(function(){
    
    ItemView = Backbone.Marionette.ItemView.extend({
        template: '#itemTemplate',
        tagName: 'li',
        className: 'list-group-item hover'
    });

    
    CollectionView = Backbone.Marionette.CollectionView.extend({
        itemView: ItemView,
        tagName: 'ul',
        className: 'list-group list-group-sp',
        events :{
            "click .chk" : "clickChk"
        },
        clickChk : function(e){
            $('.chkd').attr('checked', false);
            $('.chkd').removeClass('chkd');
            $(e.target).addClass("chkd");
            var eventChild = $(e.target).parents('.checkbox').children('a');
            $('#selected-event').text($(eventChild).html());
            $('#selected-event-ip').val($(eventChild).html());
            $('#selected-event').attr('href',$(eventChild).attr('href'));
            $('#selected-event-url').val($(eventChild).attr('href'));
            $('#selected-event-id').val($(eventChild).attr('data-target'));
        }
    });
    
    var SaveView = Backbone.View.extend({     
        el: $('#step4'),
        events: {
            "click #save"   : "save",
        },
        save: function(e) {
            $('#save').text('Saving...');
            $('#save').addClass('btn-success disabled');
            $('#save').removeClass('btn-info');
            var Job = Parse.Object.extend("job");
            var newJob = new Job();
            var o = {};
            var a = $('#final-form').serializeArray();
            $.each(a, function() {
                if (o[this.name]) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                o[this.name].push(this.value || '');
                } else {
                    o[this.name] = this.value || '';
                }
            });
            
            var query = new Parse.Query(Job);
            var newJobId = 0;
            query.exists("jobId");
            query.descending("jobId");
            query.limit(1);
            query.find({
                success: function(results) {
                    for (var i = 0; i < results.length; i++) { 
                        var object = results[i];
                        newJobId = object.get("jobId");
                    }
                    o["jobId"] = newJobId + 1;
                    newJob.save(o,{
                        success:function(object){
                            console.log('saved successfully!');
                            $('#save').text('Success!');
                            $('#save').removeClass('btn-info');
                            $('#save').addClass('btn-success');
                            $('#saved-advert').attr('href','/jobs/' + object.attributes.jobId);
                            $('#saved-advert').html('Save Successful. Click Here to go to your Advert!');
                        },
                        error:function(object){
                            console.log('error saving!');
                            console.log(object);
                            $('#save').removeClass('btn-info');
                            $('#save').addClass('btn-danger');
                        }
                    });
                },
                error: function(error) {
                    console.log('Error trying to get the latest Job Id from the DB' + error);
                    $('#save').removeClass('btn-info');
                    $('#save').addClass('btn-danger');
                    $('#save').text('Error');
                    console.log('error saving!');
                    console.log(object);
                }
            });            
        }
    });
    
    var TaskAppView = Backbone.View.extend({     
        el: $('#main-widget'),
        events: {
            "click #next-button"   : "click",
        },
        click: function(e) {
            if($('.step-pane.active')[0].id == 'step1'){
                var loc = $('#loc-input').val();
                var skills = $('#skills-input').val();
                console.log(loc + skills);
                Eventbrite({'app_key': "P47XBRPQTVS7YF64Z5"}, function(eb){
                    var params = {'city': loc, 'keywords':skills};
                    eb.event_search( params, function( response ){
                    $('#no-of-events').html(response.events.length);
                    response.events.shift();
                    collection = new Backbone.Collection(response.events);
                    var view = new CollectionView({
                        collection: collection
                    });
                    $('#event-list').html(view.render().el);
                    $('.progress-bar').css('width','100%');
                    $('.progress-bar').attr('data-original-title','100%');
                });
                });
            }else if($('.step-pane.active')[0].id == 'step3'){
                
                $('#selected-location').text($('#loc-input').val());
                $('#selected-location-ip').val($('#loc-input').val());
                
                $('#selected-skills').text($('#skills-input').val());
                $('#selected-skills-ip').val($('#skills-input').val());
                
                $('#selected-description').text($('#job-description').val());
                $('#selected-description-ip').val($('#job-description').val());
            }
        }
    });    
   
    var AppRouter = Backbone.Router.extend({
        routes: {
    
        },
        initialize: function () {
            new TaskAppView();
            new SaveView();
            Parse.initialize("1VLvUdvqRdm6AUlXbQRL2MbWERa65hMccF9GWzpG", "Hq7DY9cxSYsR3gmV3r4iFv62d8bT0xiNaP8EdZFL");
        }

    });

    var app = new AppRouter();
    Backbone.history.start();
});