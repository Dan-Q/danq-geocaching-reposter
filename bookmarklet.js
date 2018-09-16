/*
Author: Dan Q
Author URI: https://danq.me/
License: GPLv3
*/

if(/^https:\/\/www\.geocaching\.com\/my\/logs\.aspx/.test(window.location.href)){

  // Geocaching.com

  const table = document.querySelector('#divContentMain > table'); // > selector is necessary for compatability with GCVote
  for(tr of Array.from(table.querySelectorAll('tbody > tr'))){
    let tds = Array.from(tr.querySelectorAll('td'));
    let data = {
                  type: tds[0].querySelector('img').alt,
                  fp: (tds[1].innerHTML.replace(/[\r\n]/g, '').replace(/ +/g, ' ').trim() != ''),
                  date: tds[2].innerText.replace(/[\r\n]/g, '').replace(/ +/g, ' ').trim(),
                  gcUrl: tds[3].querySelector('a').href,
                  region: tds[4].innerText.replace(/[\r\n]/g, '').replace(/ +/g, ' ').trim(),
                  logUrl: tds[5].querySelector('a').href
               };
    data.logId = data.logUrl.match(/LUID=(.*)/)[1];
    data.logAlreadyImported = geocaching_com_logids.includes(data.logId);

    tr.insertAdjacentHTML('beforeend', `
      <td>
        <a class="import-into-wp" href="#wp-import-${data.logUrl}"
                                        data-type="${data.type}"
                                          data-fp="${data.fp}"
                                        data-date="${data.date}"
                                      data-gc-url="${data.gcUrl}"
                                      data-region="${data.region}"
                                     data-log-url="${data.logUrl}"
                                      data-log-id="${data.logId}">
          ${(data.logAlreadyImported ? '<small>Already imported!</small>' : 'Import into WP')}
        </a>
      </td>
    `);
  }

  // When import links clicked:
  for(a of Array.from(document.querySelectorAll('.import-into-wp'))){
    a.addEventListener('click', async (e)=>{
      e.preventDefault();
      let data = e.target.dataset;
      data.source = 'geocaching_com';
      e.target.innerText = 'Getting cache data...'
      await fetch(data.gcUrl, { credentials: 'include', redirect: 'follow' }).then(r=>r.text()).then(html=>{
        const gcDoc = (new DOMParser()).parseFromString(html, "text/html");
        data.gcCode = gcDoc.querySelector('.CoordInfoCode').innerText;
        data.gcTitle = gcDoc.querySelector('#ctl00_ContentBody_CacheName').innerText;
        data.gcDifficulty = gcDoc.querySelector('#ctl00_ContentBody_uxLegendScale img').alt.match(/^\d+/)[0];
        data.gcTerrain = gcDoc.querySelector('#ctl00_ContentBody_Localize12 img').alt.match(/^\d+/)[0];
        data.gcSize = gcDoc.querySelector('#ctl00_ContentBody_size img').alt.match(/Size: (.+)/)[1];
        inlineJS = Array.from(gcDoc.querySelectorAll('body script')).filter(script=>!script.src).map(s=>s.innerText).join("\n");
        data.lat = inlineJS.match(/lat=(\-?\d+\.\d+)/)[1];
        data.lng = inlineJS.match(/lng=(\-?\d+\.\d+)/)[1];
      });
      e.target.innerText = 'Getting log data...'
      await fetch(data.logUrl, { credentials: 'include', redirect: 'follow' }).then(r=>r.text()).then(html=>{
        const logDoc = (new DOMParser()).parseFromString(html, "text/html");
        data.logText = logDoc.querySelector('#ctl00_ContentBody_LogBookPanel1_LogText').innerHTML;
        if(imgLink = logDoc.querySelector('#ctl00_ContentBody_LogBookPanel1_ImageMain')) data.logImg = imgLink.href;
        data.logAuthor = logDoc.querySelector('#ctl00_ContentBody_LogBookPanel1_lbLogText a').innerText;
        data.logTitle = logDoc.querySelector('#ctl00_ContentBody_LogBookPanel1_lbLogText').innerText.trim().replace('  ', ` ${data.gcCode} `);
      });
      // Put data into temporary form and submit
      let form = document.createElement('form');
      form.setAttribute('method', 'POST');
      form.setAttribute('action', wp_url);
      form.setAttribute('target', '_blank');
      let input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', 'logdata');
      input.setAttribute('value', JSON.stringify(data));
      form.appendChild(input);

      let submit = document.createElement('input');
      submit.setAttribute('type', 'submit');
      form.appendChild(submit);

      document.querySelector('body').appendChild(form);
      e.target.innerText = 'Sending to WP...'
      form.submit();
      e.target.innerText = 'Imported!'
      for(td of Array.from(e.target.parentElement.parentElement.querySelectorAll('td'))) td.style.backgroundColor = '#fee';
    });
  }

} else if(/^https:\/\/opencache\.uk\/my_logs\.php/.test(window.location.href)) {

  // Opencache.uk

  const table = document.querySelector('.searchdiv table');
  for(tr of Array.from(table.querySelectorAll('tbody > tr'))){

    let tds = Array.from(tr.querySelectorAll('td'));
    if(tds.length == 1) continue; // skip special header/footer "line" rows
    if(tds[5].innerText == 'Geocache') continue; // skip header row (Y U NO <thead>!?)

    const dateDMY = tds[0].innerText.split('-');
    let data = {
                  date: `${dateDMY[2]}-${dateDMY[1]}-${dateDMY[0]}`,
                  type: tds[3].querySelector('img').src.match(/-(.+)\.png$/)[1],
                  gcUrl: tds[4].querySelector('a').href,
                  gcType: tds[4].querySelector('img').src.match(/-(.+)\.png$/)[1],
                  logUrl: tds[5].querySelector('a').href,
               };
    data.logId = data.logUrl.match(/viewlogs\.php\?logid=(\d+)/)[1];
    data.logAlreadyImported = opencache_uk_logids.includes(data.logId);

    tr.insertAdjacentHTML('beforeend', `
      <td>
        <a class="import-into-wp" href="#wp-import-${data.logUrl}"
                                        data-type="${data.type}"
                                        data-date="${data.date}"
                                      data-gc-url="${data.gcUrl}"
                                     data-log-url="${data.logUrl}"
                                      data-log-id="${data.logId}">
          ${(data.logAlreadyImported ? '<small>Already imported!</small>' : 'Import into WP')}
        </a>
      </td>
    `);
  }

  // When import links clicked:
  for(a of Array.from(document.querySelectorAll('.import-into-wp'))){
    a.addEventListener('click', async (e)=>{
      e.preventDefault();
      let data = e.target.dataset;
      data.source = 'opencache_uk';
      e.target.innerText = 'Getting cache data...'
      await fetch(data.gcUrl, { credentials: 'include', redirect: 'follow' }).then(r=>r.text()).then(html=>{
        const gcDoc = (new DOMParser()).parseFromString(html, "text/html");
        data.gcCode = gcDoc.querySelector('.content-title-noshade-size5').innerText.trim().split(' - ')[1];
        data.gcTitle = gcDoc.querySelector('.content-title-noshade-size5').innerText.trim().split(' - ')[0];
        data.gcDifficulty = gcDoc.querySelectorAll('.img-difficulty')[0].title.match(/\d+$/)[0];
        data.gcTerrain = gcDoc.querySelectorAll('.img-difficulty')[1].title.match(/\d+$/)[0];
        latLngUrl = gcDoc.querySelector('#viewcache-map a').dataset.src;
        data.lat = latLngUrl.match(/lat=(\-?\d+\.\d+)/)[1];
        data.lng = latLngUrl.match(/lon=(\-?\d+\.\d+)/)[1];
      });
      e.target.innerText = 'Getting log data...'
      await fetch(data.logUrl, { credentials: 'include', redirect: 'follow' }).then(r=>r.text()).then(html=>{
        const logDoc = (new DOMParser()).parseFromString(html, "text/html");
        data.logText = logDoc.querySelector('.viewcache_log-content').innerHTML.trim();
        data.logAuthor = logDoc.querySelectorAll('.currentuser-log a')[1].innerText;
        data.logTitle = `${data.logAuthor} ${data.type} ${data.gcCode} ${data.gcTitle}`;
      });
      // Put data into temporary form and submit
      let form = document.createElement('form');
      form.setAttribute('method', 'POST');
      form.setAttribute('action', wp_url);
      form.setAttribute('target', '_blank');
      let input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', 'logdata');
      input.setAttribute('value', JSON.stringify(data));
      form.appendChild(input);

      let submit = document.createElement('input');
      submit.setAttribute('type', 'submit');
      form.appendChild(submit);

      document.querySelector('body').appendChild(form);
      e.target.innerText = 'Sending to WP...'
      form.submit();
      e.target.innerText = 'Imported!'
      for(td of Array.from(e.target.parentElement.parentElement.querySelectorAll('td'))) td.style.backgroundColor = '#fee';
    });
  }

} else {
  alert('This bookmarklet must be run on a page listing geocaching logs.')
}
