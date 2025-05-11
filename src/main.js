import './style.css'
import javascriptLogo from '/src/assets/svg/javascript.svg'
import viteLogo from '/svg/vite.svg'
import { setupCounter } from '/src/util/counter.js'

document.querySelector('#app').innerHTML = `
  <div>
      <div class="flex flex-row gap-2">
        <img src="${viteLogo}" class="logo" alt="Vite logo" />
        <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
        <h class="text-xl">Moin Vite!</h1>
        <button class="btn btn-outline" id="counter" type="button"></button>
      </div>
  </div>
`

setupCounter(document.querySelector('#counter'))
