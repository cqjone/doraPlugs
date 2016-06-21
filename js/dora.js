/**
 * Created by Administrator on 2015/10/20.
 */
!(function($){
    'use strict';
    //禁止滚动事件
    function stopScroll(e){
        e.preventDefault();
    }

    //初始化alert,dialog等容器位置
    function setContainerPosition(obj){

        var uitype = $(obj).attr('ui-type');
        if(uitype == 'alert' || uitype == 'tips' || uitype == 'block' || uitype == 'layer'){
            var $clone = $(obj).clone().css('display', 'block').appendTo('body');
            var top = Math.round((document.documentElement.clientHeight - $clone.height()) / 2);
            var left = Math.round((document.documentElement.clientWidth - $clone.width()) / 2);
            top = top > 0 ? top : 0;
            left = left > 0 ? left : 0;
            $clone.remove();
            $(obj).css({
                "top" : top,
                "left" : left
            });
        }

    }

/**
 * doraSlider
 * @charset utf-8
 * @extends jquery.1.10.1
 * @fileOverview 焦点轮播图
 * @author 肖燊
 * @version 1.0
 * @date 2016-04-27
 * @example
 * $('#demo1').doraSlider({});
 */

    $.fn.doraSlider = function(settings){

        var defaultSettings = {
            width: '100%', //容器宽度
            height: '4em', //容器高度
            showFocus : true, // 轮播点是否显示
            during: 5000, //间隔时间
            speed: 200 //滑动速度
        };
        var settings = $.extend(true, {}, defaultSettings, settings);

        return this.each(function(){
            var _this = $(this);
            var _showFocus = settings.showFocus;
            var _during = settings.during;
            var _speed = settings.speed;
            var _slideIndex = 1; // 轮播索引值
            var _imgWidth = $(_this).width();
            var _ulContainer = $(_this).find('ul');
            var _liContainer = $(_this).find('ul li');
            var _imgNum = $(_liContainer).length; // 图片个数
            var _totalImgNum = _imgNum + 2;
            var _imgBoxWidth = _imgWidth * _totalImgNum;
            var _oPosition = {}; //触点位置
            var _startX = 0, _startY = 0; //触摸开始时手势横纵坐标
            var _temPos = - _imgWidth ;
            var _slideTask;

            //容器样式
            $(_this).css({height : settings.height});
            //图片容器
            $(_ulContainer).css({
                width : _imgBoxWidth,
                left : -_imgWidth
            });
            //图片展示列表
            $(_liContainer).css({
                width : $(_this).width()
            });

            var _firstObj = $(_this).find('ul li').eq(0);
            var _lastObj = $(_this).find('ul li').eq(_imgNum-1);
            //构造循环对象
            $(_ulContainer).append(_firstObj.clone());
            $(_ulContainer).prepend(_lastObj.clone());

            //添加轮播事件
            if(_imgNum > 1){
                autoMove();
                //添加轮播小点
                addFocus();
            }

            if (isMobile()) {
                if(_imgNum > 1){
                    //绑定触摸事件
                    bindEvent();
                }
            }

            function bindEvent(){
                _ulContainer.get(0).addEventListener('touchstart', touchStartFunc, false);
                _ulContainer.get(0).addEventListener('touchmove', touchMoveFunc, false);
                _ulContainer.get(0).addEventListener('touchend', touchEndFunc, false);
            }

            function removeBindEvent(){
                _ulContainer.get(0).removeEventListener('touchstart',touchStartFunc, false);
                _ulContainer.get(0).removeEventListener('touchmove',touchMoveFunc, false);
                _ulContainer.get(0).removeEventListener('touchend',touchEndFunc, false);
            }


            function autoMove(){
                clearInterval(_slideTask);
                _slideTask = setInterval(function(){
                    _slideIndex = _slideIndex + 1;
                    removeBindEvent();
                    $(_ulContainer).animate({
                        left : - _slideIndex * _imgWidth
                    },_speed,function(){
                        setCurrentPos();
                        bindEvent();
                    })
                },_during)
            }

            //重置图片集合的位置
            function setCurrentPos(){
                if(_slideIndex == _totalImgNum - 1){
                    $(_ulContainer).css({left : -_imgWidth + 'px'});
                    _slideIndex = 1;
                }else if(_slideIndex == 0){
                    $(_ulContainer).css({left : -(_totalImgNum - 2) * _imgWidth + 'px'});
                    _slideIndex = _totalImgNum - 2;
                }
                //切换轮播小点
                $(_this).find('.focus span').eq(_slideIndex-1).addClass('current').siblings().removeClass('current');
            }

            function addFocus(){
                _this.append('<div class="focus"><div></div></div>');
                var oFocusContainer = $(".focus",_this);
                for (var i = 0; i < _imgNum; i++) {
                    $("div", oFocusContainer).append("<span></span>");
                }
                var oFocus = $("span", oFocusContainer);
                oFocus.first().addClass("current");
                oFocusContainer.css({
                    display : _showFocus
                })
            }

            //判断是否是移动设备
            function isMobile(){
                if(navigator.userAgent.match(/Android/i) || navigator.userAgent.indexOf('iPhone') != -1 || navigator.userAgent.indexOf('iPod') != -1 || navigator.userAgent.indexOf('iPad') != -1) {
                    return true;
                }
                else {
                    return false;
                }
            }

            //获取触点位置
            function touchPos(e){
                var touches = e.changedTouches, l = touches.length, touch, tagX, tagY;
                for (var i = 0; i < l; i++) {
                    touch = touches[i];
                    tagX = touch.clientX;
                    tagY = touch.clientY;
                }
                _oPosition.x = tagX;
                _oPosition.y = tagY;
                return _oPosition;
            }

            //触摸开始
            function touchStartFunc(e){
                touchPos(e);
                _startX = _oPosition.x;
                _startY = _oPosition.y;
                _temPos = _ulContainer.position().left;
            }

            //触摸移动
            function touchMoveFunc(e){
                clearInterval(_slideTask);
                touchPos(e);
                var moveX = _oPosition.x - _startX;
                var moveY = _oPosition.y - _startY;
                if (Math.abs(moveY) < Math.abs(moveX)) {
                    e.preventDefault();
                    _ulContainer.css({
                        left: _temPos + moveX
                    });
                }
            }

            //触摸结束
            function touchEndFunc(e){
                touchPos(e);
                var moveX = _oPosition.x - _startX;
                var moveY = _oPosition.y - _startY;
                if (Math.abs(moveY) < Math.abs(moveX)) {
                    if (moveX > 0) {
                        _slideIndex--;
                        if(_slideIndex >= 0){
                            doAnimate(- _slideIndex * _imgWidth, autoMove);
                        }else{
                            doAnimate(0, autoMove);
                        }
                    }
                    else {
                        _slideIndex++;
                        if (_slideIndex < _totalImgNum && _slideIndex >= 0) {
                            doAnimate( - _slideIndex * _imgWidth, autoMove);
                        }
                        else {
                            _slideIndex = _totalImgNum - 1;
                            doAnimate(-_slideIndex * _imgWidth, autoMove);
                        }
                    }
                }
            }


            //动画效果
            function doAnimate(iTarget, fn){
                removeBindEvent();
                _ulContainer.stop().animate({
                    left: iTarget
                }, _speed , function(){
                    setCurrentPos();
                    bindEvent();
                    if (fn){
                        fn();
                    }
                });
            }
        });

    };


/*
 * layer控件
 * @charset utf-8
 * @extends jquery.1.10.1
 * @fileOverview 弹窗组件
 * @author 肖燊
 * @version 1.0
 * @date 2016-04-27
 *
 * */

    $.doraLayer = {

        open({style = '',type = 'alert',title = '',msg = '默认内容',yes = ()=>{},no = ()=>{} ,btn = ['确认','取消'],time = 2000
            ,shadeClose = true}){
            var targetHtml;
            if(type == 'alert'){
                targetHtml = this.getAlertHtml(title,msg,style,btn);
                addMaster({type,targetHtml,yes,shadeClose});
            }else if(type == 'confirm'){
                targetHtml = this.getConfirmHtml(title,msg,style,btn);
                addMaster({type,targetHtml,yes,no,shadeClose});
            }else if(type == 'tips'){
                targetHtml = this.getTipsHtml(msg,style);
                addMaster({type,targetHtml,yes,time,shadeClose});
            }else if(type == 'loading'){
                targetHtml = this.getLoadingHtml();
                addMaster({type,targetHtml});
            }
        },

        close(){
            var _targetObj = $("[ui-type='layer']");
            var _masterObj = $('body').find('.doraui_mask');
            $(_targetObj).remove();
            $(_masterObj).remove();
        },

        getAlertHtml(title,msg,style,btn){
            var alertHtml = `
            <div class="alert-block ${style}" ui-type="layer" style="z-index: 19870427">
                <div class="icon-close"></div>
                ${title == "" ? '' : '<h3 class="alert-title">'+title+'</h3>'}
                <p class="alert-body">${msg}</p>
                <div class="alert-footer">
                    <ul class="averagebox">
                         <li class='confirm-btn'>${btn[0]}</li>
                    </ul>
                </div>
            </div>
            `;
            return alertHtml;
        },

        getConfirmHtml(title,msg,style,btn){
            var confirmHtml = `
                <div class="alert-block" ui-type="layer" style="z-index: 19870427">
                <div class="icon-close"></div>
                ${title == "" ? '' : '<h3 class="alert-title">'+title+'</h3>'}
                <p class="alert-body">${msg}</p>
                <div class="alert-footer">
                    <ul class="averagebox">
                        ${btn.length > 1 ? "<li class='confirm-btn'>"+btn[0]+"</li><li class='cancel-btn'>"+btn[1]+"</li>" : "<li class='confirm-btn'>"+btn[0]+"</li>"}
                    </ul>
                </div>
            </div>
            `;
            return confirmHtml;
        },

        getTipsHtml(msg,style){
            var tipsHtml = `
                <div class="alert-tip" ui-type="layer" style="z-index: 19870427">
                    <p>${msg}</p>
                </div>
            `;
            return tipsHtml;
        },

        getLoadingHtml(){
            var loadingHtml = `
                <div class="alert-loading" ui-type="layer">
                    <div class="loading-icon"></div>
                    <p>请等待...</p>
                </div>
            `
            return loadingHtml;
        }

    };


    function addMaster(params){

        var _body = $('body');
        var _targetObj = $(params.targetHtml);
        var _objId = "layer_" + Math.round(Math.random() * 10000);
        var _masterObj =  $("<div class='doraui_mask' style='z-index: 19870426'></div>");
        if(params.type == 'alert' || params.type == 'confirm' || params.type == 'tips' || params.type == 'loading'){
            $(_masterObj).appendTo(_body);
        }

        $(_targetObj).appendTo(_body);
        $(_targetObj).attr('id',_objId);

        //绑定按钮事件
        bindButtonEvent(params.type,_targetObj,_masterObj,params.yes,params.no,params.shadeClose);
        //容器居中显示
        setContainerPosition(_targetObj);
        _targetObj.addClass('show-layer');

        if(params.type == 'tips'){
            setTimeout(()=>{
                hideLayer(_targetObj,_masterObj);
                if(params.yes){
                    params.yes();
                }
            }, params.time);
        }

    }

    function bindButtonEvent(type,_targetObj,_masterObj,confirm,cancel,shadeClose){

        //document.body.addEventListener('touchmove', stopScroll , false);
        if(shadeClose){
            $('body').find('.doraui_mask').click(function(){
                hideLayer(_targetObj,_masterObj);
            });
        }
        if(type == 'alert'){
            document.body.addEventListener('touchmove', stopScroll , false);
            $(_targetObj).find('.confirm-btn').click(function(){
                hideLayer(_targetObj,_masterObj);
                if(confirm) confirm();
            });
            $(_targetObj).find('.icon-close').click(function(){
                hideLayer(_targetObj,_masterObj);
            });
        }else if(type == 'confirm'){
            $(_targetObj).find('.confirm-btn').click(function(){
                hideLayer(_targetObj,_masterObj);
                if(confirm) confirm();
            });

            $(_targetObj).find('.cancel-btn').click(function(){
                enableScroll();
                hideLayer(_targetObj,_masterObj);
                if(cancel) cancel();
            });

            $(_targetObj).find('.icon-close').click(function(){
                enableScroll();
                hideLayer(_targetObj,_masterObj);
            });

            //针对弹窗内文本的滚动
            var _alertBodyObj = $(_targetObj).find('.alert-body');
            var disableScroll = function(){
                $(document).on('mousewheel', preventDefault);
                $(document).on('touchmove', preventDefault);
            };
            var enableScroll = function(){
                $(document).off('mousewheel', preventDefault);
                $(document).off('touchmove', preventDefault);
                $(document.body).css({"overflow-y":"auto",'position': 'static','top': 'auto'});
            };

            // 内部可滚
            $(_alertBodyObj).on('mousewheel', innerScroll);
            // 外部禁用
            disableScroll();

            // 移动端touch重写
            var startX, startY;
            $(_alertBodyObj)[0].addEventListener('touchstart', function(e){
                startX = e.changedTouches[0].pageX;
                startY = e.changedTouches[0].pageY;
            },false);

            // 仿innerScroll方法
            $(_alertBodyObj)[0].addEventListener('touchmove', function(e){
                e.stopPropagation();
                $(document.body).css({"overflow-y":"hidden",'position': 'fixed','top': $(document.body).scrollTop()*-1 });

                var deltaX = e.changedTouches[0].pageX - startX;
                var deltaY = e.changedTouches[0].pageY - startY;

                // 只能纵向滚
                if(Math.abs(deltaY) < Math.abs(deltaX)){
                    e.preventDefault();
                    return false;
                }

                var box = $(this).get(0);
                if($(box).height() + box.scrollTop >= box.scrollHeight){
                    if(deltaY < 0) {
                        e.preventDefault();
                        return false;
                    }
                }
                if(box.scrollTop === 0){
                    if(deltaY > 0) {
                        e.preventDefault();
                        return false;
                    }
                }

            },false);
        }else if(type == 'tips'){
            document.body.addEventListener('touchmove', stopScroll , false);
        }else if(type == 'loading'){
            document.body.addEventListener('touchmove', stopScroll , false);
        }

    }

    function hideLayer(_targetObj,_masterObj){
        _targetObj.removeClass('show-layer');
        _masterObj.remove();
        document.body.removeEventListener('touchmove', stopScroll , false);
        setTimeout(()=>{
            _targetObj.remove();
        },400)
    }

    function preventDefault(e) {
        e = e || window.event;
        e.preventDefault && e.preventDefault();
        e.returnValue = false;
    }

    function stopPropagation(e){
        e = e || window.event;
        e.stopPropagation && e.stopPropagation();
        e.cancelBubble = false;
    }

    function innerScroll(e){
        // 阻止冒泡到document
        // document上已经preventDefault
        stopPropagation(e);

        var delta = e.wheelDelta || e.detail || 0;
        var box = $(this).get(0);

        if($(box).height() + box.scrollTop >= box.scrollHeight){
            if(delta < 0) {
                preventDefault(e);
                return false;
            }
        }
        if(box.scrollTop === 0){
            if(delta > 0) {
                preventDefault(e);
                return false;
            }
        }
    }




})(jQuery);

