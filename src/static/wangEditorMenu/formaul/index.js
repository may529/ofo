(function () {

    // 获取 wangEditor 构造函数和 jquery
    var E = window.wangEditor;
    var $ = window.jQuery;
    var iframeUrl = "./static/kityformula/index.html";

    function createIframe(editor,$formaul){
      // console.log(formaul);
      window.formaul = $($formaul).attr('data-formaul') || '';
      var $iframe = $("<iframe style='height: 374px; width:785px;border:0px;' scrolling='auto' allowtransparency='true' src='"+iframeUrl+"'></iframe>");
      $.modal({
        title:'公式编辑',
        body:$iframe,
        height:424,
        width:785,
        onSubmit:function( e ,callback){
          $iframe[0].contentWindow.factory.editor.execCommand('get.image.data',function(data){
            var formaul = $iframe[0].contentWindow.jQuery(".kf-editor-input-box").val();
            if( $formaul && $formaul.length != 0 ){
              $formaul.attr('src',data.img).attr('data-formaul',formaul);
            }else{
              $formaul = $("<img class='formaul notimg' src='"+data.img+"' data-formaul='"+formaul+"'/>");
              editor.command(e.origin,'insertHtml',$formaul[0].outerHTML);
            }
            callback();
          });
        }
      });
    }
    // 菜单
    E.createMenu(function (check) {

        // 定义菜单id，不要和其他菜单id重复。编辑器自带的所有菜单id，可通过『参数配置-自定义菜单』一节查看
        var menuId = 'formaul';

        // check将检查菜单配置（『参数配置-自定义菜单』一节描述）中是否该菜单id，如果没有，则忽略下面的代码。
        if (!check(menuId)) {
            return;
        }

        // this 指向 editor 对象自身
        var editor = this;

        // 创建 menu 对象
        var menu = new E.Menu({
            editor: editor,  // 编辑器对象
            id: menuId,  // 菜单id
            title: '公式', // 菜单标题

            // 正常状态和选中装下的dom对象，样式需要自定义
            $domNormal: $('<a href="#" tabindex="-1"><i class="wangeditor-menu-img-omega"></i></a>'),
            $domSelected: $('<a href="#" tabindex="-1" class="selected"><i class="wangeditor-menu-img-omega"></i></a>')
        });

        // // 要插入的符号（可自行添加）
        // var symbols = ['∑', '√', '∫', '∏', '≠', '♂', '♀']
        //
        // // panel 内容
        // var $container = $('<div></div>');
        // $.each(symbols, function (k, value) {
        //     $container.append('<a href="#" style="display:inline-block;margin:5px;">' + value + '</a>');
        // });
        //
        // // 插入符号的事件
        // $container.on('click', 'a', function (e) {
        //     var $a = $(e.currentTarget);
        //     var s = $a.text();
        //
        //     // 执行插入的命令
        //     editor.command(e, 'insertHtml', s);
        // });
        //
        // // 添加panel
        // menu.dropPanel = new E.DropPanel(editor, menu, {
        //     $content: $container,
        //     width: 350
        // });

        // 增加到editor对象中
        menu.clickEventSelected = menu.clickEvent = function(e){
          var $formaul = $( editor.getRangeElem() );
          //console.log( $formaul );
          var formaul = null;
          if( $formaul.hasClass(".formaul") ){
            formaul = $formaul.data("formaul");
          }
          createIframe(editor,formaul);
        }
        editor.menus[menuId] = menu;
    });

    //插件
    E.plugin(function () {

        // 此处的 this 指向 editor 对象本身
        var editor = this;
        var $txt = editor.$txt;

        $txt.on('click', '.formaul', function (e) {
            var $formaul = $(e.currentTarget);
            createIframe(editor,$formaul);
        });
    });
})()
