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
        console.log('pic', pic)
        let card = document.createElement('div');
        card.className = "card";
        card.innerHTML = `
        <a href="#">
          <div class="lazyImageBox" style="height:${height}px">
            <img src="" alt="" data-image="${pic}">
          </div>
          <p>${title}</p>
        </a>
        `
        columns[index].append(card);
      })
    }
  }

  return {
    async init() {
      let data = await utils.ajax("./data.json");
      bindHTML(data)
    },
  };
})();

imageModule.init();
