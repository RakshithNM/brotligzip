const SERVER_URL = "https://brotligzip.onrender.com";
//const SERVER_URL = "http://localhost:8000";
let brotliLabelInitial = "BROTLI";
let gzipLabelInitial = "GZIP";

const filesize = document.querySelector('#filesize');
const compression = document.querySelector('#compression');
const fetching = document.querySelector('#fetching');
const time = document.querySelector('#time');
const table = document.getElementById('table');
const filesizeSelect = document.getElementById('filesize_select');

const brotliLabel = document.querySelector('#brotli-label');
const gzipLabel = document.querySelector('#gzip-label');

brotliLabel.innerText = brotliLabelInitial;
gzipLabel.innerText = gzipLabelInitial;

let filesInfo = [];
let chosenFile = '';
let chosenCompression = '';
let start_time;

const reset = () => {
  if(table.innerText) {
    table.innerText = '';
  }
  start_time = 0;
}

const showUIStatus = () => {
  if(fetching.innerHTML) {
    fetching.innerHTML = '';
  }
  const currentFileInfo = filesInfo.filter((info) => info[chosenFile])
  const brotliFileInfoForCurrentFile = currentFileInfo.filter((info) => info[chosenFile].name.endsWith('.br'));
  const gzipFileInfoForCurrentFile = currentFileInfo.filter((info) => info[chosenFile].name.endsWith('.gz'));

  if(brotliFileInfoForCurrentFile.length > 0) {
    if(brotliLabel.innerHTML) {
      brotliLabel.innerHTML = '';
    }
    const size =  brotliFileInfoForCurrentFile[0][chosenFile].size;
    brotliLabelText = `${brotliLabelInitial} <small>${size}</small>`;
  }
  if(gzipFileInfoForCurrentFile.length > 0) {
    if(gzipLabel.innerHTML) {
      gzipLabel.innerHTML = '';
    }
    const size =  gzipFileInfoForCurrentFile[0][chosenFile].size;
    gzipLabelText = `${gzipLabelInitial} <small>${size}</small>`;
  }
  if(chosenFile !== "") {
    brotliLabel.innerHTML += brotliLabelText;
    gzipLabel.innerHTML += gzipLabelText;
  }
  const chosenFileText = `You have chosen <mark>${chosenFile}</mark> file`;
  let chosenFileCompressionText = "";
  if(chosenCompression) {
    chosenFileCompressionText = `You have chosen <mark>${chosenCompression}</mark> compression method<br />`;
  }
  let statusText = "";
  if(chosenFile !== "" && chosenCompression !== "") {
    statusText = `Press <mark class="button-look">FETCH</mark> to fetch the file with the compression`;
    fetcher.classList.add('animate');
    fetcher.removeAttribute('disabled');
  }
  else if(chosenCompression === "") {
    statusText = `Choose <mark>compression</mark> to start fetching the file`;
  }
  fetching.classList.remove('hide');
  time.classList.add('hide');
  fetching.innerHTML = `${chosenFileText}<br />${chosenFileCompressionText}${statusText}`;
}

const clearUIStatus = () => {
  if(fetching.innerHTML) {
    fetching.innerHTML = "";
  }
}

compression.addEventListener('change', (e) => {
  chosenCompression = e.target.value ? e.target.value : 'brotli';
  showUIStatus();

  compression.classList.remove('animate');

  reset();
  removeIncludedScripts();
});

filesize.addEventListener('change', (e) => {
  chosenFile = e.target.value ? e.target.value : null;
  if(chosenFile === null) {
    return;
  }

  showUIStatus();

  reset();
  removeIncludedScripts();

  filesizeSelect.classList.remove('animate');
  compression.removeAttribute('disabled');
  if(chosenCompression === "") {
    compression.classList.add('animate');
  }
});

const displayData = () => {
  if(window.data) {
    const headerRow = table.insertRow();
    const headerCell = headerRow.insertCell();
    headerCell.innerText = `DATA FROM LOADED FILE`;

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
  fetching.classList.add('hide');
  time.classList.remove('hide');
  time.innerHTML = `It took <mark class="time">${end_time - start_time}ms</mark> to fetch the file`;

  filesize.removeAttribute('disabled');
  compression.removeAttribute('disabled');
  fetcher.removeAttribute('disabled');

  clearUIStatus();
  displayData();
}

const removeIncludedScripts = () => {
  const brotliscript = document.getElementById('brotliscript');
  const gzipscript = document.getElementById('gzipscript');
  if(brotliscript) {
    document.body.removeChild(brotliscript);
  }
  if(gzipscript) {
    document.body.removeChild(gzipscript);
  }
  delete window.data;
}

const fetchCompressedFile = () => {
  const fetchURL = `${SERVER_URL}/file`;
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
          myScript.setAttribute("src", `${SERVER_URL}/${chosenFile}`);
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

fetcher.addEventListener('click', (e) => {
  fetcher.classList.remove('animate');

  if(!chosenCompression || chosenCompression === '') {
    console.log("no compression method chosen");
    return;
  }
  if(!chosenFile || chosenFile === '') {
    console.log("no file chosen");
    return;
  }

  filesize.setAttribute('disabled', true);
  compression.setAttribute('disabled', true);

  if(start_time > 0) {
    start_time = 0;
  }

  removeIncludedScripts();

  if(e.target.tagName === 'BUTTON') {
    fetchCompressedFile();
  }
});

const displayFileNames = (inFileInfo) => {
  filesInfo = inFileInfo;
  const filesToSelectFrom = [...new Set(inFileInfo.map((info) => Object.keys(info).join('')))];
  let firstOption = document.createElement('option');
  firstOption.value = null;
  firstOption.text = "Select a file"
  filesizeSelect.add(firstOption, null);

  for(var file of filesToSelectFrom) {
    let option = document.createElement('option');
    option.value = file;
    option.text = file;
    filesizeSelect.add(option, null);
  }

  filesizeSelect.classList.add('animate');
  compression.setAttribute('disabled', true);
  fetcher.setAttribute('disabled', true);
}

const fetchFileNames = () => {
  const fetchURL = `${SERVER_URL}/fileNames`;
  const fetchOptions = {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };
  try {
    fetch(fetchURL, fetchOptions)
      .then(response => response.json())
      .then(data => {
        if(!data.error) {
          if(data.files === null || data.files === void 0) {
            return;
          }
          displayFileNames(data.files);
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

fetchFileNames();
