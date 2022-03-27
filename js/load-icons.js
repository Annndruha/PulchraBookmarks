function loadAllIcons(linkchanged = false) {
    chrome.storage.local.get(['cols', 'rows'], function (res) {
        for (let r = 0; r < res['rows']; r++) {
            for (let c = 0; c < res['cols']; c++) {
                let id = r.toString() + c.toString()
                loadIcon(id, linkchanged)
            }
        }
    })
}


function loadIcon(id, linkchanged=false) {
    try {
        let itemInside = document.getElementById(id)
        if (itemInside.hasAttribute('icon-link')){
            let imgOld = document.getElementById('icon-' + id)
            if (varDefined(itemInside.getAttribute('icon-link'))){
                imgOld.src = document.getElementById(id).getAttribute('icon-link')
            }
            else {
                autoIcon(id, linkchanged)
            }
        }
        else {
            if  (linkchanged){
                autoIcon(id, linkchanged)
            }
            else if(!itemInside.hasAttribute('cache-icon-link')){
                autoIcon(id)
            }
        }
    } catch (e) {
        console.log(e)
    }
}

function autoIcon(id, linkchanged=false){
    let bm = document.getElementById(id)
    let link = bm.getAttribute('link')
    let imgOld = document.getElementById('icon-' + id)
    if (linkchanged) { // Placeholders
        if (id !== 'preview') {
            bm.setAttribute('cache-icon-link', 'images/icons/autorenew.svg')
            imgOld.src = 'images/icons/autorenew.svg'
        }
        else {
            bm.setAttribute('cache-icon-link', 'images/icons/language.svg')
            imgOld.src = 'images/icons/language.svg'
        }
    }
    if (varDefined(link)) {
        loadBestIcon(link, id)
    } else {
        if (id !== 'preview') {
            if (document.getElementById('icon-' + id)) {
                document.getElementById('icon-' + id).remove()
            }
        }
    }
}

function loadBestIcon(link, id){
    let links = [getOpenLink(getDomain(link)) + '/favicon.ico',
                'https://s2.googleusercontent.com/s2/favicons?domain=' + getOpenLink(link) + '&sz=64']

    let google_img = new Image()
    google_img.src = links[1]
    google_img.onload = () => waitToLoadFavicon(google_img, links[0], id, true)
    google_img.onerror = () => waitToLoadFavicon(google_img, links[0], id, false)
}

function waitToLoadFavicon(google_img, fav_link, id, loaded1) {
    let fav_img = new Image()
    fav_img.src = fav_link
    fav_img.onload = () => remakeIcon(google_img, fav_img, id, loaded1, true)
    fav_img.onerror = () => remakeIcon(google_img, fav_img, id, loaded1, false)
}


function remakeIcon(google_img, fav_img, id, loaded1, loaded2) {
    let imgOld = document.getElementById('icon-' + id)
    if (imgOld === null) { // When remake grid so fast
        return
    }
    if (loaded1 && loaded2) {
        if (google_img.naturalWidth >= fav_img.naturalWidth) {
            imgOld.src = google_img.src
        } else {
            imgOld.src = fav_img.src
        }
    } else if (loaded1) {
        if (google_img.naturalWidth !== 16) {
            imgOld.src = google_img.src
        } else {
            imgOld.src = '../images/icons/language.svg'
        }
    } else if (loaded2) {
        imgOld.src = fav_img.src
    } else {
        imgOld.src = '../images/icons/language.svg'
    }

    if (id !== 'preview') {
        chrome.storage.local.get([id], function (res) {
            let storage_value = res[id]
            storage_value[0]['cache-icon-link'] = imgOld.src
            chrome.storage.local.set({[id]: storage_value}, () => {
            })
        })
    }
}