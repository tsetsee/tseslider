/**
 * @author tsetsee_yugi
 * @email tsetsee.yugi@gmail.com
 * @date 2015-04-30
 * @version 1.0
 */
(function ($) {

    $.fn.tseslider = function (options) {
        var me = this;
        var value;
        if (typeof options === "string") {
            switch (options) {
                case "value":
                    if (arguments.length > 1) {
                        me.trigger("tseslider:setValue", parseFloat(arguments[1]));
                    } else {
                        return me.triggerHandler("tseslider:getValue");
                    }
                    break;
                case "update":
                    me.trigger("tseslider:update");
                    break;
            }
            return this;
        }

        var opts = $.extend({}, $.fn.tseslider.defaults, options);

        this.html("<div class='tse-slide-track'><div class='tse-slide-filler'></div><div class='tse-slide-cursor'></div></div>");
        var $track = this.find(".tse-slide-track")
        var $cursor = this.find(".tse-slide-cursor");
        var $filler = this.find(".tse-slide-filler");

        if (!opts.maxValue) {
            opts.maxValue = $track.width();
        }

        if (opts.step) {
            opts.hasStep = true;
            opts.stepsize = $track.width() / (opts.maxValue - opts.minValue) * opts.step;
        }

        var cursorTopConst = ($track.height() - $cursor.height()) / 2.0;
        var cursorLeftConst = -$cursor.width() / 2.0;
        $cursor.css("transform", "translate("+cursorLeftConst+"px, "+ cursorTopConst +"px)");

        $cursor.on("mousedown touchstart", function (e) {
            e.preventDefault();
            $(document.body).addClass("dragmode").data("target", me);
        });

        function updatePosition(d, fn) {
            if (d < 0)
                d = 0;
            else if (d > $track.width())
                d = $track.width();
            if (opts.hasStep) {
                d = (Math.round(d / opts.stepsize)) * opts.stepsize;
            }
            $filler.width(d);
            $cursor.css("transform", 'translate('+(d+cursorLeftConst)+'px,'+cursorTopConst + "px)");
            if(fn) fn();
        }

        me.on("tseslider:getValue", function () {
            return value;
        }).on("tseslider:setValue", function (e, val) {
            changeValue(val);
            me.trigger("tseslider:changed");
        }).on("tseslider:update", function () {
            var valchanged = false;
            opts.step = me.data("step");
            opts.maxValue = me.data("max-value");
            opts.minValue = me.data("min-value");

            var newval = me.data("value");

            if(newval) {
                value = newval;
                valchanged = true;
            }

            if(!opts.maxValue) {
                opts.maxValue = $track.width();
            }
            if (opts.step) {
                opts.hasStep = true;
                opts.stepsize = $track.width() / (opts.maxValue - opts.minValue) * opts.step;
            }

            if(value < opts.minValue) {
                value = opts.minValue;
            } else if(value > opts.maxValue) {
                value = opts.maxValue;
            }

            cursorTopConst = ($track.height() - $cursor.height()) / 2.0;
            cursorLeftConst = -$cursor.width() / 2.0;

            changeValue(value);
            me.trigger('tseslider:changed');

        }).on("tseslider:move", function (e, d) {
            updatePosition(d - $track.offset().left, calcValue);
        });

        $track.click(function (e) {
            if(!$(document.body).hasClass("dragmode")) {
                updatePosition(e.pageX - $track.offset().left, calcValue);
            }
        });

        function changeValue(newval) {
            var d;
            if (newval < opts.minValue)
                newval = opts.minValue;
            else if (newval > opts.maxValue)
                newval = opts.maxValue;

            value = newval;
            if (opts.hasStep) {
                d = (newval - opts.minValue) * opts.stepsize / opts.step;
            } else {
                d = (newval - opts.minValue) * $track.width() / (opts.maxValue - opts.minValue);
            }
            updatePosition(d);
        }

        function calcValue() {
            if (opts.hasStep) {
                value = Math.round($filler.width() / opts.stepsize) * opts.step + opts.minValue;
            } else {
                value = ($filler.width() / $track.width()) * (opts.maxValue - opts.minValue) + opts.minValue;
            }
            me.trigger('tseslider:changed');
        }

        if (opts.value != null) {
            changeValue(opts.value);
        } else {
            value = opts.minValue;
        }
        me.trigger("tseslider:ready");

        return this;
    };

    $.fn.tseslider.defaults = {
        hasStep: false,
        maxValue: null,
        minValue: 0,
        step: null,
        value: null
    };

    $(document).ready(function () {
        $.each($(".tseslider"), function (i, el) {
            var $el = $(el);
            $el.tseslider({
                step: $el.data("step"),
                maxValue: $el.data("max-value"),
                minValue: $el.data("min-value"),
                value: $el.data("value")
            });
        });


        $(document.body).on("mouseup touchend", function (e) {
            if ($(this).hasClass("dragmode")) {
                $(this).data("target", null).removeClass("dragmode");
            }
        }).on("mousemove touchmove", function (e) {
            if ($(this).hasClass("dragmode")) {
                if (e.type == 'touchmove') {
                    var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                    $(this).data("target").trigger("tseslider:move", [touch.pageX]);
                } else {
                    $(this).data("target").trigger("tseslider:move", [e.pageX]);
                }
            }
        });
    });


}(jQuery));