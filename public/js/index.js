(function () {
  // tableクリック時
  document.querySelectorAll('tr').forEach(tr => {
    tr.addEventListener('click', function () {
      const id = this.id;
      const splited = id.split('-');
      if (id && splited[1]) {
        const title = splited[1];
        location.href = `/blogs/${title}`;
      }
    });
  });

  // 追加クリック時
  document.getElementById('append-blog').addEventListener('click', function () {
    const template = document.querySelector('.appendable');
    if (!template) return

    const copy = template.cloneNode(true)
    copy.querySelectorAll('input').forEach(input => {
      input.value = ''
    });
    copy.querySelectorAll('textarea').forEach(input => {
      input.value = ''
    });

    const form = document.querySelector('form')
    form.appendChild(copy)
  });
})()