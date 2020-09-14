/*
  浏览器渲染页面的步骤
    1. 构建DOM树
    2. 构建CSSOM树
    3. 生成Render Tree
    4. 布局
    5. 分层
    6. 栅格化图层
    7. 绘制渲染页面

  构建DOM树中如果遇到 img
   老版本浏览器：阻碍DOM树渲染
   新版本： 不会阻碍 每一个图片请求，每一个图片请求都会占用一个HTTP请求（浏览器同时发送的HTTP请求有6个）
      拿回来资源后会和 Render Tree一起渲染
    .....
    开始加载图片，一定会让页面第一次渲染速度边度（首屏白屏）

    图片延迟加载：第一次不请求也不渲染图片，等页面加载完，其它资源都渲染好了，再去请求加载图片
      原理： 显示图片的部分拿一个盒子先占位，盒子有一个默认的背景图（loading图）
      开始：图片不加载，我们把真实图片的地址赋值给img的自定义属性： data-src/data-img
      步骤：
        1. 创建一个img外层的div，叫 lazyImageBox，并设置一个默认的Loading背景图
        2. 第一次请求时，把img的透明度设置为0，等页面全部加载完毕的时候，再发送第二次请求，加载图片
        3. 等图片回来时，把透明度设置为1，并添加一个透明度过渡动画
    注意事项：如果图片要进行延迟加载，在图片未显示之前，要让盒子的高度等于图片的高度，这样才能把盒子撑开（
          （服务器返回的数据中，一定要包含图片的高度和宽度）
  
  延迟加载优化：
    在页面滚动的时候，出现在首屏视口内的图片才做延迟加载，未出现的部分可以不做延迟加载
*/

let imageModule = (function () {
  let columns = Array.from(document.querySelectorAll(".column"));
  // 数据绑定
  function bindHTML(data) {
    // 根据服务器返回的图片的宽度和高度，动态计算出图片放在width: 230px容器中，高度应该怎么缩放
    // 因为后期要做图片的 延迟加载，在没有图片之前，也需要知道未来图片要渲染的高度，这样才能有一个容器先占位
    data = data.map((item) => {
      let { width, height } = item;
      item.height = height * (230 / width);
      item.width = 230;
      return item;
    });

    // 每三个为一组获取数据
    for (let i = 0; i < data.length; i++) {
      let group = data.slice(i, i + 3);

      // 实现每一列的降序排列
      columns.sort((a, b) => {
        // 把每一列按照它们的高度排序
        return b.offsetHeight - a.offsetHeight;
      });

      // 把一组的数组进行升序
      group.sort((a, b) => {
        return a.height - b.height;
      });

      //分别把最小数据插入到最大列中
      group.forEach((item, index) => {
        let { width, height, title, pic } = item;
        let card = document.createElement("div");
        card.className = "card";
        // Chrome 76以上才好用（兼容性问题）
        // 根据当前窗口的高度 网速 滚动 窗口大小改变，来决定哪些渲染哪些不渲染
        card.innerHTML = `
        <a href="#">
          <div class="lazyImageBox" style="height:${height}px">
            <img src="${pic}" alt="" loading="lazy">
          </div>
          <p>${title}</p>
        </a>
        `;
        columns[index].append(card);
      });
    }
  }

  return {
    async init() {
      let data = await utils.ajax("./data.json");
      bindHTML(data);
    },
  };
})();

imageModule.init();

// todo: 这种方案需要把 图片的不透明度去掉，还有默认的loading图
// 如果 loading="lazy"不兼容情况下，需要自己写一个插件，（通过上述的那些方法）
if ("loading" in new Image()) {
  console.log("ok");
}

// typeof IntersectionObserver === 'undefined'
// ...