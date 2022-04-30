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

  if(brotliLabel.innerHTML) {
    brotliLabel.innerHTML = '';
  }

  if(gzipLabel.innerHTML) {
    gzipLabel.innerHTML = '';
  }

  if(brotliFileInfoForCurrentFile.length > 0) {
    const size =  brotliFileInfoForCurrentFile[0][chosenFile].size;
    brotliLabelText = `${brotliLabelInitial} <small>${size}</small>`;
  }
  if(gzipFileInfoForCurrentFile.length > 0) {
    const size =  gzipFileInfoForCurrentFile[0][chosenFile].size;
    gzipLabelText = `${gzipLabelInitial} <small>${size}</small>`;
  }
  if(chosenFile !== "") {
    brotliLabel.innerHTML += brotliLabelText;
    gzipLabel.innerHTML += gzipLabelText;
  }
  const chosenFileText = `FILE: <mark>${chosenFile.toUpperCase()}</mark>`;
  const chosenFileCompressionText = `${chosenCompression ? `COMPRESSION: <mark>${chosenCompression.toUpperCase()}</mark>` : ''}`;
  let statusText = "";
  if(chosenFile !== "" && chosenCompression !== "") {
    statusText = `CLICK <mark class="button-look">FETCH</mark>`;
    fetcher.classList.add('animate');
    fetcher.removeAttribute('disabled');
  }
  else if(chosenCompression === "") {
    statusText = `Select a <mark>compression</mark>`;
  }
  fetching.classList.remove('hide');
  time.classList.add('hide');

  const chosenFileCompressionTextHTML = document.createElement('p');
  chosenFileCompressionTextHTML.innerHTML = `${chosenFileCompressionText}`;
  if(chosenCompression === '') {
    chosenFileCompressionTextHTML.classList.add('hide');
  }

  const statusTextHTML = document.createElement('p');
  statusTextHTML.innerHTML = `${statusText}`;
  console.log(chosenCompression, "chosenCompression");
  if(chosenCompression === '') {
    statusTextHTML.classList.add('red');
  }

  fetching.innerHTML += `<p>${chosenFileText}</p>`;
  fetching.append(chosenFileCompressionTextHTML);
  fetching.append(statusTextHTML);
}

const clearUIStatus = () => {
  if(fetching.innerHTML) {
    fetching.innerHTML = "";
  }
}

compression.addEventListener('change', (e) => {
  chosenCompression = e.target.value ? e.target.value : null;
  if(chosenCompression === null) {
    return;
  }
  showUIStatus();

  compression.classList.remove('animate');
  fetcher.classList.remove('hide');

  reset();
  removeIncludedScripts();
});

filesize.addEventListener('change', (e) => {
  chosenFile = e.target.value ? e.target.value : null;
  if(chosenFile === null || chosenFile === "null") {
    compression.classList.add('hide');
    fetcher.classList.add('hide');
    time.classList.add('hide');
    fetching.classList.add('hide');

    chosenCompression = '';
    let ele = document.getElementsByName("compression");
    for(let i = 0; i < ele.length; i++) {
       ele[i].checked = false;
    }
    return;
  }

  showUIStatus();

  reset();
  removeIncludedScripts();

  filesizeSelect.classList.remove('animate');
  compression.classList.remove('hide');
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
  time.innerHTML = `<mark class="time">${end_time - start_time}ms</mark><br /><strong><small>TIME TAKEN TO FETCH THE FILE</small></strong>`;

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
