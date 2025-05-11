import './style.css'
import javascriptLogo from '/src/assets/svg/javascript.svg'
import viteLogo from '/svg/vite.svg'
import { setupCounter } from '/src/util/counter.js'
import { showBarChart } from "/src/viz/bar.js";

document.querySelector('#app').innerHTML = `
  <div>
      <div class="flex flex-row gap-2">
        <img src="${viteLogo}" class="logo" alt="Vite logo" />
        <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
        <h class="text-xl">Moin Vite!</h1>
        <button class="btn btn-primary" id="counter" type="button"></button>
      </div>
      <div class="border p-3 mt-2" id="viz-container"></div>
  </div>
`

setupCounter(document.querySelector('#counter'));

showBarChart();
