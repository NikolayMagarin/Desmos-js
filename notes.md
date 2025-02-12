## connect to dev server in desmos (add script in browser on desmos page)

```
// Ручная загрузка и выгрузка графика по кнопкам
(() => {
    let p = document.getElementsByClassName('dcg-right-pillbox-elements')[0];
    let e = document.createElement('div');
    e.innerHTML = `
    <div class="dcg-btn-flat-gray dcg-btn-flat-gray-group dcg-group-vertical" role="group" aria-label="Состояние">
    <div class="dcg-tooltip-hit-area-container dcg-display-block dcg-do-not-blur dcg-cursor-default" tabindex="-1" ontap="">
    <div class="dcg-action-zoomin dcg-pillbox-btn-interior" role="button" tabindex="0" aria-label="Получить" ontap="">
    <img style="width: 15px; height: 16px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAOVBMVEVHcEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADLcPMfAAAAE3RSTlMAg2ecJBA2uavKLWDALglM3nd1sLj9NQAAAFpJREFUGNOtj0kKwDAIADXN4pKt/f9jG0EIlPbWAT2M4gLwQYwPgfi3aGpC96JYT8SrushptdQ5awNIeUVZCYRZrFiSC7/URKewpwfqAIPpcIiHadHgqLy8fQO+owIhKYOxtAAAAABJRU5ErkJggg==" alt="download">
    </div>
    </div>
    <div class="dcg-tooltip-hit-area-container dcg-display-block dcg-do-not-blur dcg-cursor-default" tabindex="-1" ontap="">
    <div class="dcg-action-zoomout dcg-pillbox-btn-interior" role="button" tabindex="0" aria-label="Установить" ontap="">
    <img style="width: 15px; height: 16px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAPFBMVEVHcEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACHr/7WAAAAFHRSTlMAg2ecEDbGLbmr1j1iSwl7HCYgRme55ugAAABgSURBVBjTfY+BCsAgCEStlabVatv//+taFBVsOxC8JycK8CGi1XsRv3gUwYkQBqUCjtR5gVIQjzlUwKo/YM0AxpZy9mlTqkNnOsi5g5312KR5B4jIWxNjrHcG3RTo5e0bDl8CPObkeAEAAAAASUVORK5CYII=" alt="upload">
    </div>
    </div>
    <input type="file" accept=".json" id="set-state-input" style="display: none">
    </div>`;
    e = e.children[0];
    p.insertBefore(e, p.children[1]);
    e.children[0].onclick = () => {
    const a = document.createElement('a');
    const text = JSON.stringify(Calc.getState(), null, 2);
    a.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
    );
    a.setAttribute('download', 'graph.json');
    a.style.display = 'none';
    a.click();
    };
    e.children[1].onclick = () => {
    const input = document.getElementById('set-state-input');
    input.value = null;
    input.click();
    input.onchange = async () => {
        if (input.files[0]) {
        const state = JSON.parse(await input.files[0].text());
        Calc.setState(state);
        }
    };
    };
})();

// Опрос локального сервера для обновления графика в реальном времени (для разработки)
(() => {
    const st = document.createElement('pre');
    // prettier-ignore
    (document.querySelector('#graph-container > div > div > div > div.dcg-grapher.dcg-grapher-2d > div:nth-child(3)').appendChild(st),
    st.style = 'position: absolute;bottom: 5px;right: 5px;font-size: 12px;margin: 0px;overflow: hidden;border: 1px solid rgba(0, 0, 0, .1);border-radius: 5px;background: rgb(237 237 237);width: 18px;height: 18px;text-align: center;color: black;')
    st.textContent = '…';
    st.title = 'connecting to dev server…';
    st.style.cursor = 'default';

    let socket = new WebSocket('ws://localhost:8085');

    socket.onopen = () => {
    st.textContent = '✓';
    st.style.color = 'green';
    st.title = 'connected to dev server';
    };

    socket.onmessage = async (event) => {
    try {
        Calc.setState(JSON.parse(await event.data.text()));
    } catch (err) {
        console.error(err);
    }
    };

    socket.onclose = () => {
    onError();
    };

    function onError() {
    console.log(
        'Dev server ws://localhost:8085 is unavailable or not working correctly'
    );
    st.textContent = '⟳';
    st.style.color = 'red';
    st.title = 'click to reconnect to dev server';
    st.style.cursor = 'pointer';

    st.onclick = () => {
        st.onclick = null;
        st.style.cursor = 'default';
        st.title = 'connecting to dev server…';
        st.textContent = '…';
        st.style.color = 'black';

        socket = new WebSocket('ws://localhost:8085');
        socket.onopen = () => {
        st.textContent = '✓';
        st.style.color = 'green';
        st.title = 'connected to dev server';
        };
        socket.onmessage = async (event) => {
        try {
            Calc.setState(JSON.parse(await event.data.text()));
        } catch (err) {
            console.error(err);
        }
        };
        socket.onclose = () => {
        onError();
        };
    };
    }
})();
```

## show state in desmos (for debugging purposes)

```
const e = document.createElement('pre');
document.querySelector('#graph-container > div > div > div > div.dcg-grapher.dcg-grapher-2d > div:nth-child(3)').appendChild(e);
e.style = 'position: relative; top: 5px; left: 5px; font-size: 10px; user-select: all; max-width: 30%; max-height: calc(100vh - 50px); margin: 0; background: rgba(10,0,10,0.02); overflow: auto';
setInterval(()=>{
    const state = Calc.getState();
    state.expressions.list.forEach((expr) => {
        if (expr.type === 'image') {
            let k;
            if (expr.image_url) {
                k = expr.image_url;
                expr.image_url = k.slice(0, 30)+'...'+k.slice(k.length - 5);
            }
            if (expr.clickableInfo && expr.clickableInfo.hoveredImage) {
                k = expr.clickableInfo.hoveredImage;
                expr.clickableInfo.hoveredImage = k.slice(0, 30)+'...'+k.slice(k.length - 5);
            }
            if (expr.clickableInfo && expr.clickableInfo.depressedImage) {
                k = expr.clickableInfo.depressedImagel
                expr.clickableInfo.depressedImage = k.slice(0, 30)+'...'+k.slice(k.length - 5);
            }
        }
    })
    e.textContent = JSON.stringify(state, null, 1);
}, 1000)
```
