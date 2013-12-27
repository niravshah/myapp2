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
    
    
});