let chosenCompression = '';
const fieldset = document.querySelector('fieldset');
const fetching = document.querySelector('#fetching');
const time = document.querySelector('#time');
let start_time;

fieldset.addEventListener('change', (e) => {
  chosenCompression = e.target.value ? e.target.value : 'brotli';
  if(fetching.innerHTML) {
    fetching.innerHTML = '';
  }
  fetching.innerHTML += `Click 'FETCH' button to fetch <mark>${chosenCompression}</mark> compressed file`;
});

const display = () => {
  const table = document.getElementById('table');
  if(window.data) {
    for(var user of window.data) {
      const tr = table.insertRow();
      const keys = Object.keys(user);
      for(var key of keys) {
        const tc = tr.insertCell();
        tc.innerText = user[key];
      }
    }
  }
}

const scriptLoaded = () => {
  const end_time = performance.now();
  if(time.innerText) {
    time.innerText = '';
  }
  time.innerText = `${end_time - start_time}ms`;
  display();
}

fetcher.addEventListener('click', (e) => {
  if(!chosenCompression || chosenCompression === '') {
    return;
  }
  if(start_time > 0) {
    start_time = 0;
  }
  const brotliscript = document.getElementById('brotliscript');
  const gzipscript = document.getElementById('gzipscript');

  if(brotliscript) {
    document.body.removeChild(brotliscript);
  }
  if(gzipscript) {
    document.body.removeChild(gzipscript);
  }
  if(e.target.tagName === 'BUTTON') {
    const fetchURL = 'http://localhost:8000/compressed';
    const fetchData = {
      method: chosenCompression
    };
    const fetchOptions = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fetchData),
    };
    try {
      fetch(fetchURL, fetchOptions)
        .then(response => response.json())
        .then(data => {
          if(!data.error) {
            let myScript = document.createElement("script");
            myScript.id = `${data.method}script`;
            myScript.setAttribute("src", "http://localhost:8000/493KB.js");
            document.body.appendChild(myScript);
            start_time = performance.now();
            myScript.addEventListener("load", scriptLoaded, false);
          }
        })
        .catch(error => {
          console.error('there was an error', error)
        });
    }
    catch(error) {
      console.error('there was an error', error)
    }
  }
});
