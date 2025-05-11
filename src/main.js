import './style.css'
import javascriptLogo from '/src/assets/svg/javascript.svg'
import { setupCounter } from '/src/util/counter.js'
import viteLogo from '/svg/vite.svg'
import exampleStarMap from "@/viz/exampleStarMap.js";

document.querySelector('#app').innerHTML = `
  <div>
      <div class="flex flex-row gap-2">
        <img src="${viteLogo}" class="logo" alt="Vite logo" />
        <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
        <h1 class="text-3xl font-bold">Astrolabium</h1>
        <button class="btn btn-primary" id="counter" type="button"></button>
      </div>
      <div id="viz-container"></div>
  </div>
`
setupCounter(document.querySelector('#counter'));

exampleStarMap();
