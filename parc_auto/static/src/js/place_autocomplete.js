/*
* @Author: D.Jane
* @Email: jane.odoo.sp@gmail.com
*/
odoo.define('parc_auto.place_autocomplete', function(require){

    var form_widgets = require('web.form_widgets');
    var core = require('web.core');
    var MapWidget = require('parc_auto.map_widget');


    var place_autocomplete = form_widgets.FieldChar.extend({
        init: function(field_manager, node){
            this._super(field_manager, node);
            this.lat = 50.862117;
            this.lng = 4.416593;
        },
        initialize_content: function(){
            this._super();
            var self = this;
            this.t = setInterval(function () {
                if (typeof google != 'undefined') {
                    self.on_ready();
                }
            }, 1000);
        },
        on_ready: function(){
            var self = this;

            if(self.t){
                clearInterval(self.t);
            }

            if (!self.$input) {
                return;
            }

            var map_widget = new MapWidget(self);
            map_widget.insertAfter(self.$input);

            // init gmap marker position
            var geocoder = new google.maps.Geocoder;
            geocoder.geocode({'address': self.$input.val()}, function (results, status) {
                if (status === 'OK') {
                    self.lat = results[0].geometry.location.lat();
                    self.lng = results[0].geometry.location.lng();
                    map_widget.lat = self.lat;
                    map_widget.lng = self.lng;
                }
            });

            var autocomplete = new google.maps.places.Autocomplete((self.$input[0]), {types: ['geocode']});

            autocomplete.addListener('place_changed', function (){
                var place = autocomplete.getPlace();
                
                if(!place.geometry || !place.geometry.location){
                    return;
                }

                var location = place.geometry.location;
                self.lat = location.lat();
                self.lng = location.lng();
                // update gmap
                map_widget.update_marker(self.lat, self.lng);
            });
            // fix
            if(self.t){
                clearInterval(self.t);
            }
        },
        update_place: function (lat, lng) {
            var self = this;

            if (lat === this.lat && lng === this.lng) {
                return;
            }

            this.lat = lat;
            this.lng = lng;

            var geocoder = new google.maps.Geocoder;
            var latLng = new google.maps.LatLng(lat, lng);
            geocoder.geocode({'location': latLng}, function (results, status) {
                if (status === 'OK') {
                    if (self.$input) {
                        self.$input.val(results[0].formatted_address);
                        self.commit_value();
                    }
                }
            });
        }
    });

    core.form_widget_registry.add('place_autocomplete', place_autocomplete);
});