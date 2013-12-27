$(function(){
    

    Mod.VcModel = Backbone.Model.extend({
        defaults: {
            denomination: ''
        }
    });    
    
    Mod.VcCollection = Backbone.Collection.extend({
        model: Mod.VcModel
    });
    
   Mod.VcItemView = Backbone.Marionette.ItemView.extend({
        template: '#vcode-item-template',
    });

    Mod.VcCollectionView = Backbone.Marionette.CollectionView.extend({
        itemView: Mod.VcItemView,
    });

    Mod.VcodesController = Backbone.Marionette.Controller.extend({
        
        displayResults : function(denArr){
            var modelArr = [];
            for(i=0;i<denArr.length;i++){
                var model = new Mod.VcModel({'index': i, 'denomination':denArr[i]});
                modelArr.push(model);
            }
            var collection = new Mod.VcCollection(modelArr);
            var view = new Mod.VcCollectionView({collection : collection});
            $('#vcodes-div').html(view.render().el);
        }
      
    });
    
    Mod.RewardsView = Backbone.View.extend({
        el: $('#content'),
        events :{
            'click #generate-codes' :'generateCodes',
            'click #rewards-prev' :'actionButtonClicked',
            'click #rewards-next' :'actionButtonClicked',
            'click #save-reward' :'saveReward'
        },
        generateCodes: function(){
            var arr = {};
            var dens = $('[id^=vcodes-den]');
            var qtys = $('[id^=vcodes-qty]');
            var codes = $('[id^=vcodes-code]');
            for(i=0;i<dens.length;i++){
                arr[dens[i].innerText] = qtys[i].value;
            }
            $.ajax({url: '/cc', data:{parms:arr},
                success: function(results){
                    for(var result in results){
                        for(i=0;i<dens.length;i++){
                            if(dens[i].innerText == result){
                               $(codes[i]).val(results[result].toString());
                            }
                        }
                    }
                }
            });
        },        
        actionButtonClicked: function(){
            var prevTarget = $('ul[class="steps"] li[class="active"]').attr('data-target');
            if(prevTarget == '#step2'){
                var all = $('#voucher-pills').children('ul').children('li');
                var denArr = [];
                for(i=0;i<all.length;i++){
                    denArr.push(all[i].innerText);
                }
                new Mod.VcodesController().displayResults(denArr);
            }
        },
        saveReward:function(){
            
            var Reward = Parse.Object.extend("reward");
            var query = new Parse.Query(Reward);
            var rewardId = 1;
            query.exists("rewardId");
            query.descending("rewardId");
            query.limit(1);
            query.find({
                success: function(results) {
                    for (var i = 0; i < results.length; i++) { 
                        var object = results[i];
                        rewardId = object.get("rewardId") + 1;
                    } 
                    $('#reward-id').val(rewardId);
                    var $files = $('.image-data');
                    $.each($files,function(index){
                        var data = $(this).data();
                        data.url = '/upload?rid='+rewardId;
                        data.submit();  
                        $(this).removeClass('image-data');
                    });
                    var newReward = new Reward();
                    var rO = {};
                    rO['rewardId']=rewardId;
                    rO['campaignName']=$('#campaign-name').val();
                    rO['campaignStart']=$('#campaign-start').val();
                    rO['campaignEnd']=$('#campaign-end').val();
                    var vcodes = {};
                    var dens = $('[id^=vcodes-den]');
                    var qtys = $('[id^=vcodes-qty]');
                    var codes = $('[id^=vcodes-code]');
                    for(i=0;i<dens.length;i++){
                        if($(codes[i]).val().indexOf(',') > 0){
                         vcodes[dens[i].innerText] = $(codes[i]).val().split(',');
                        }else{
                            vcodes[dens[i].innerText] = $(codes[i]).val();
                        }
                    }
                    rO['vcodes']=vcodes;
                    newReward.save(rO,{
                        success:function(){
                            console.log('Saved new Reward ', rewardId);
                        },
                        error:function(){
                            console.log('Error saving new Reward ',rewardId);
                        }
                    });
                    
                    
                    
                },
                error: function(error){}
            });
            
            
            
            
        }
    });

    var AppRouter = Backbone.Router.extend({
        initialize: function () {
            new Mod.RewardsView();
            Parse.initialize("1VLvUdvqRdm6AUlXbQRL2MbWERa65hMccF9GWzpG", "Hq7DY9cxSYsR3gmV3r4iFv62d8bT0xiNaP8EdZFL");
        }
    });    
    
    var app = new AppRouter();
    Backbone.history.start();
});