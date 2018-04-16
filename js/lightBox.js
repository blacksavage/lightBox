;(function ($) {
    var LightBox = function (settings) {
        var _this = this;

        this.settings = {
            speed: 500
        };
        $.extend(this.settings, settings || {});

        // 创建遮罩和弹出框
        this.popupMask = $('<div id="G-lightBox-mask"></div>');
        this.popupWin = $('<div id="G-lightBox-popup"></div>');

        // 保存body
        this.bodyNode = $(document.body);

        // 渲染剩余的DOM，并且插入到body
        this.renderDOM();
        // 图片预览区
        this.picViewArea = this.popupWin.find('div.lightBox-pic-view');
        // 图片
        this.popupPic = this.popupWin.find('img.lightBox-image');
        // 图片描述区
        this.picCaptionArea = this.popupWin.find('div.lightBox-pic-caption');
        // 按钮
        this.nextBtn = this.popupWin.find('span.lightBox-next-btn');
        this.prevBtn = this.popupWin.find('span.lightBox-prev-btn');
        // 图片描述
        this.captionText = this.popupWin.find('p.lightBox-pic-desc');
        // 图片索引
        this.currentIndex = this.popupWin.find('span.lightBox-of-index');
        // 关闭按钮
        this.closeBtn = this.popupWin.find('div.lightBox-close-btn');

        // 当前组名
        this.groupName = null;
        // 当前组的数据
        this.groupData = [];
        // 图片点击事件
        this.bodyNode.on('click', '*[data-role="lightBox"]', function (e) {
            e.stopPropagation();
            var currentGroupName = $(this).attr('data-group');

            if (currentGroupName !== _this.groupName) {
                _this.groupName = currentGroupName;
                // 根据当前组名获取同一组数据
                _this.getGroup();
            }

            // 初始化弹窗
            _this.initPopup($(this));
        });

        // 关闭弹窗
        this.popupMask.click(function () {
            $(this).fadeOut();
            _this.popupWin.fadeOut();
            _this.clear = false;
        });
        this.closeBtn.click(function () {
            _this.popupMask.fadeOut();
            _this.popupWin.fadeOut();
            _this.clear = false;
        });

        // 上下切换按钮事件
        // 是否可以点击（防止动画执行过程中多次点击）
        this.flag = true;
        this.nextBtn.hover(function () {
            if (!$(this).hasClass('disabled') && _this.groupData.length > 1) {
                $(this).addClass('lightBox-next-btn-show');
            }
        }, function () {
            if (!$(this).hasClass('disabled') && _this.groupData.length > 1) {
                $(this).removeClass('lightBox-next-btn-show');
            }
        }).click(function (e) {
            e.stopPropagation();
            if (!$(this).hasClass('disabled') && _this.flag) {
                _this.flag = false;
                _this.goTo('next');
            }
        });
        this.prevBtn.hover(function () {
            if (!$(this).hasClass('disabled') && _this.groupData.length > 1) {
                $(this).addClass('lightBox-prev-btn-show');
            }
        }, function () {
            if (!$(this).hasClass('disabled') && _this.groupData.length > 1) {
                $(this).removeClass('lightBox-prev-btn-show');
            }
        }).click(function (e) {
            e.stopPropagation();
            if (!$(this).hasClass('disabled') && _this.flag) {
                _this.flag = false;
                _this.goTo('prev');
            }
        });
        // 窗口变化
        var timer = null;
        // 弹窗不显示的情况下，不执行改变方法
        this.clear = false;
        // ie6
        this.isIE6 = /MSIE 6.0/gi.test(window.navigator.userAgent);
        $(window).resize(function () {
            if (_this.clear) {
                window.clearTimeout(timer);
                timer = window.setTimeout(function () {
                    _this.loadPicSize(_this.groupData[_this.index].src);
                }, 300)
            }
            if (_this.isIE6) {
                _this.popupMask.css({
                    width: $(window).width(),
                    height: $(window).height()
                })
            }
        }).keyup(function (e) {
            var val = e.which;
            if (_this.clear) {
                if (val === 37 || val === 38) {
                    _this.prevBtn.click();
                } else if (val === 39 || val === 40) {
                    _this.nextBtn.click();
                }
            }
        });
        if (this.isIE6) {
            $(window).scroll(function () {
                _this.popupMask.css({
                    top: $(window).scrollTop()
                })
            })
        }
    };
    LightBox.prototype = {
        renderDOM: function () {
            var strDOM =
                '<div class="lightBox-pic-view">' +
                '<span class="lightBox-btn lightBox-prev-btn"></span>' +
                '<img class="lightBox-image">' +
                '<span class="lightBox-btn lightBox-next-btn"></span>' +
                '</div>' +
                '<div class="lightBox-pic-caption">' +
                '<div class="lightBox-caption-area">' +
                '<p class="lightBox-pic-desc"></p>' +
                '<span class="lightBox-of-index">当前索引：0 of 0</span>' +
                '</div>' +
                '<div class="lightBox-close-btn"></div>' +
                '</div>';
            // 插入到popupWin
            this.popupWin.html(strDOM);
            // 将遮罩及弹出层插入body
            this.bodyNode.append(this.popupMask, this.popupWin)
        },
        getGroup: function () {
            var _this = this;
            // 根据当前的组别名称获取页面中所有相同组别的对象
            var groupList = this.bodyNode.find('*[data-group="' + this.groupName + '"]');
            // 清空数组数据
            _this.groupData.length = 0;
            // 添加数据
            groupList.each(function () {
                _this.groupData.push({
                    src: $(this).attr('data-source'),
                    id: $(this).attr('data-id'),
                    caption: $(this).attr('data-caption')
                })
            })
        },
        initPopup: function (currentObj) {
            var _this = this,
                sourceSrc = currentObj.attr('data-source'),
                currentId = currentObj.attr('data-id');
            // 显示遮罩及弹窗
            this.showMaskAndPopup(sourceSrc, currentId);
        },
        // 显示遮罩及弹窗
        showMaskAndPopup: function (sourceSrc, currentId) {
            var _this = this;

            // 隐藏图片和图片描述
            this.popupPic.hide();
            this.picCaptionArea.hide();

            var winWidth = $(window).width(),
                winHeight = $(window).height();
            this.picViewArea.css({
                width: winWidth / 2,
                height: winHeight / 2
            });
            // 淡入显示遮罩
            if (this.isIE6) {
                var scrollTop = $(window).scrollTop();
                this.popupMask.css({
                    width: winWidth,
                    height: winHeight,
                    top: scrollTop
                })
            }
            this.popupMask.fadeIn();
            // 显示弹窗
            this.popupWin.fadeIn();
            var viewHeight = winHeight / 2 + 10;
            var topAnimate = (winHeight - viewHeight) / 2;
            this.popupWin.css({
                width: winWidth / 2 + 10,
                height: viewHeight,
                marginLeft: -(winWidth / 2 + 10) / 2,
                top: (this.isIE6 ? -(scrollTop + viewHeight) : -viewHeight)
            }).animate({
                top: (this.isIE6 ? (scrollTop + topAnimate) : topAnimate)
            }, _this.settings.speed, function () {
                // 传入图片src，获取图片大小，改变弹窗大小，显示图片
                _this.loadPicSize(sourceSrc);
            });
            // 根据当前点击的元素ID获取在当前组别里面的索引
            this.index = this.getIndexOf(currentId);
            var groupDataLength = this.groupData.length;
            if (groupDataLength > 1) {
                if (this.index === 0) {
                    this.prevBtn.addClass('disabled');
                    this.nextBtn.removeClass('disabled');
                } else if (this.index === groupDataLength - 1) {
                    this.prevBtn.removeClass('disabled');
                    this.nextBtn.addClass('disabled');
                } else {
                    this.prevBtn.removeClass('disabled');
                    this.nextBtn.removeClass('disabled');
                }
            } else {
                this.prevBtn.addClass('disabled');
                this.nextBtn.addClass('disabled');
            }
        },
        // 根据当前点击的元素ID获取在当前组别里面的索引
        getIndexOf: function (currentId) {
            var index = 0;
            $(this.groupData).each(function (i) {
                index = i;
                if (this.id === currentId) {
                    return false
                }
            });
            return index;
        },
        // 传入图片src，获取图片大小，改变弹窗大小，显示图片
        loadPicSize: function (sourceSrc) {
            var _this = this;
            // 清空之前图片的大小
            this.popupPic.css({
                width: 'auto',
                height: 'auto'
            }).hide();
            // 隐藏文字
            this.picCaptionArea.hide();
            // 图片加载完成后，获取图片大小，并改变弹窗大小
            this.preLoadImg(sourceSrc, function () {
                _this.popupPic.attr('src', sourceSrc);
                var picWidth = _this.popupPic.width(),
                    picHeight = _this.popupPic.height();
                _this.changePic(picWidth, picHeight);
            });
        },
        preLoadImg: function (src, cb) {
            var img = new Image();
            // ie
            if (!!window.ActiveXObject) {
                img.onreadystatechange = function () {
                    if (this.readyState === 'complete') {
                        cb();
                    }
                }
            }
            // 其余浏览器
            else {
                img.onload = function () {
                    cb();
                }
            }
            img.src = src;
        },
        // 改变窗口大小并显示图片内容
        changePic: function (width, height) {
            var _this = this,
                winWidth = $(window).width(),
                winHeight = $(window).height();
            var scale = Math.min(winWidth / (width + 10), winHeight / (height + 10), 1);
            width = width * scale;
            height = height * scale;
            this.picViewArea.animate({
                width: width - 10,
                height: height - 10
            }, _this.settings.speed);
            var top = (winHeight - height) / 2;
            if (this.isIE6) {
                top += $(window).scrollTop();
            }
            this.popupWin.animate({
                width: width,
                height: height,
                marginLeft: -(width / 2),
                top: top
            }, _this.settings.speed, function () {
                _this.popupPic.css({
                    width: width - 10,
                    height: height - 10
                }).fadeIn();
                _this.picCaptionArea.fadeIn();
                _this.flag = true;
                _this.clear = true;
            });
            // 设置描述文字和当前索引
            this.captionText.text(this.groupData[this.index].caption);
            this.currentIndex.text('当前索引： ' + (this.index + 1) + ' of ' + this.groupData.length);
        },
        // 上下切换图片
        goTo: function (dir) {
            var src = null;
            if (dir === 'next') {
                this.index++;
                if (this.index >= this.groupData.length - 1) {
                    this.nextBtn.addClass('disabled').removeClass('lightBox-next-btn-show');
                }
                if (this.index !== 0) {
                    this.prevBtn.removeClass('disabled');
                }
                src = this.groupData[this.index].src;
                this.loadPicSize(src);
            } else if (dir === 'prev') {
                this.index--;
                if (this.index !== this.groupData.length - 1) {
                    this.nextBtn.removeClass('disabled');
                }
                if (this.index <= 0) {
                    this.prevBtn.addClass('disabled').removeClass('lightBox-prev-btn-show');
                }
                src = this.groupData[this.index].src;
                this.loadPicSize(src);
            }
        }
    };
    window['LightBox'] = LightBox;
})(jQuery);