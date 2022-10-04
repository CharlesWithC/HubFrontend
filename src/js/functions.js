$(document).ready(function () {
    drivershub = `    ____       _                         __  __      __  
   / __ \\_____(_)   _____  __________   / / / /_  __/ /_ 
  / / / / ___/ / | / / _ \\/ ___/ ___/  / /_/ / / / / __ \\
 / /_/ / /  / /| |/ /  __/ /  (__  )  / __  / /_/ / /_/ /
/_____/_/  /_/ |___/\\___/_/  /____/  /_/ /_/\\__,_/_.___/ 
                                                         `
    console.log(drivershub);
    console.log("Drivers Hub: Frontend (v1.5.6)");
    console.log("Copyright © 2022 CharlesWithC All rights reserved.");
    console.log('Compatible with "Drivers Hub: Backend" (© 2022 CharlesWithC)');
});

function AjaxError(data, no_notification = false) {
    errmsg = JSON.parse(data.responseText).descriptor ? JSON.parse(data.responseText).descriptor : data.status + " " + data.statusText;
    if (!no_notification) toastFactory("error", "Error:", errmsg, 5000, false);
    console.warn(`API Request Failed: ${errmsg}\nDetails: ${data}`);
}

function GetMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

function RandomString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

function GetAvatarSrc(discordid, avatarid) {
    if (avatarid != null) {
        if (avatarid.startsWith("a_"))
            src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatarid + ".gif";
        else
            src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatarid + ".png";
    } else src = "/images/logo.png";
    return src;
}

function GetAvatarImg(src, userid, name) {
    return `<a style="cursor:pointer" onclick="LoadUserProfile(${userid})">
        <img src="${src}" style="width:20px;border-radius:100%;display:inline" onerror="$(this).attr('src','/images/logo.png');">
        <b>${name}</b>
    </a>`;
}

function GetAvatar(userid, name, discordid, avatarid){
    src = GetAvatarSrc(discordid, avatarid);
    return `<a style="cursor:pointer" onclick="LoadUserProfile(${userid})">
        <img src="${src}" style="width:20px;border-radius:100%;display:inline" onerror="$(this).attr('src','/images/logo.png');">
        ${name}
    </a>`;
}

function CopyBannerURL(userid) {
    navigator.clipboard.writeText("https://" + window.location.hostname + "/banner/" + userid);
    return toastFactory("success", "Banner URL copied to clipboard!")
}

function FileOutput(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function isJSONNumber(obj) {
    return obj !== undefined && obj !== null && obj.constructor == Number;
}

function isString(obj) {
    return obj !== undefined && obj !== null && obj.constructor == String;
}

window.btnvals = {};

function LockBtn(btnid, btntxt = "Working...") {
    $(btnid).attr("disabled", "disabled");
    btnvals[btnid] = $(btnid).html();
    $(btnid).html(btntxt);
}

function UnlockBtn(btnid) {
    $(btnid).removeAttr("disabled");
    if (btnvals[btnid] == undefined) return;
    $(btnid).html(btnvals[btnid]);
}

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};

function toastFactory(type, title, text, time, showConfirmButton) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-start',
        showConfirmButton: showConfirmButton || false,
        timer: time || '3000',
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
    });

    Toast.fire({
        icon: type,
        title: '<strong>' + title + '</strong>',
        html: text,
    });
}

function getCookie(cookiename) {
    // Get name followed by anything except a semicolon
    var cookiestring = RegExp(cookiename + "=[^;]+").exec(document.cookie);
    // Return everything after the equal sign, or an empty string if the cookie name not found
    return decodeURIComponent(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./, "") : "");
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function genBanner(btype, title, content) {
    if (btype == "info") {
        return `
        <div class="py-8 px-6" style="width:100%">
          <div class="p-6 border-l-4 border-2 border-indigo-500 rounded-r-lg bg-gray-50">
            <div class="flex">
              <div class="w-auto">
                <span class="w-auto inline-block mr-2">
                  <svg width="20" height="20" viewbox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM11 14C11 14.6 10.6 15 10 15C9.4 15 9 14.6 9 14V10C9 9.4 9.4 9 10 9C10.6 9 11 9.4 11 10V14ZM10 7C9.4 7 9 6.6 9 6C9 5.4 9.4 5 10 5C10.6 5 11 5.4 11 6C11 6.6 10.6 7 10 7Z" fill="#382CDD"></path>
                  </svg>
                </span>
              </div>
              <div class="w-full">
                <div class="flex">
                  <h3 class="text-indigo-800 font-medium">` + title + `</h3>
                </div>
                <div class="pr-6">
                  <p class="text-sm text-indigo-700">` + content + `</p>
                </div>
              </div>
            </div>
          </div>
        </div>`;
    } else if (btype == "criticle") {
        return `
        <div class="py-8 px-6" style="width:100%">
          <div class="p-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg bg-gray-50">
            <div class="flex">
              <div class="w-auto">
                <span class="w-auto inline-block mr-2">
                  <svg width="20" height="20" viewbox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM10 15C9.4 15 9 14.6 9 14C9 13.4 9.4 13 10 13C10.6 13 11 13.4 11 14C11 14.6 10.6 15 10 15ZM11 10C11 10.6 10.6 11 10 11C9.4 11 9 10.6 9 10V6C9 5.4 9.4 5 10 5C10.6 5 11 5.4 11 6V10Z" fill="#E85444"></path>
                  </svg>
                </span>
              </div>
              <div class="w-full">
                <div class="flex">
                  <h3 class="text-red-800 font-medium">` + title + `</h3>
                </div>
                <div class="pr-6">
                  <p class="text-sm text-red-700">` + content + `</p>
                </div>
              </div>
            </div>
          </div>
        </div>`;
    } else if (btype == "resolved") {
        return `
        <div class="py-8 px-6" style="width:100%">
          <div class="p-6 border-l-4 border-2 border-green-500 rounded-r-lg bg-gray-50">
            <div class="flex">
              <div class="w-auto">
                <span class="w-auto inline-block mr-2">
                  <svg width="20" height="20" viewbox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM14.2 8.3L9.4 13.1C9 13.5 8.4 13.5 8 13.1L5.8 10.9C5.4 10.5 5.4 9.9 5.8 9.5C6.2 9.1 6.8 9.1 7.2 9.5L8.7 11L12.8 6.9C13.2 6.5 13.8 6.5 14.2 6.9C14.6 7.3 14.6 7.9 14.2 8.3Z" fill="#17BB84"></path>
                  </svg>
                </span>
              </div>
              <div class="w-full">
                <div class="flex">
                  <h3 class="text-green-800 font-medium">` + title + `</h3>
                </div>
                <div class="pr-6">
                  <p class="text-sm text-green-700">` + content + `</p>
                </div>
              </div>
            </div>
          </div>
        </div>`;
    } else if (btype == "warning") {
        return `<div class="py-8 px-6" style="width:100%">
            <div class="p-6 border-l-4 border-2 border-orange-500 rounded-r-lg bg-gray-50">
            <div class="flex">
                <div class="w-auto">
                <span class="w-auto inline-block mr-2">
                    <svg width="24" height="20" viewbox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.7 15.5001L14.6 1.50011C13.8 0.100109 11.9 -0.399891 10.5 0.400109C10 0.700109 9.60001 1.10011 9.40001 1.50011L1.30001 15.5001C0.500011 16.9001 1.00001 18.8001 2.40001 19.6001C2.90001 19.9001 3.40001 20.0001 3.90001 20.0001H20C21.7 20.0001 23 18.6001 23 17.0001C23.1 16.4001 22.9 15.9001 22.7 15.5001ZM12 16.0001C11.4 16.0001 11 15.6001 11 15.0001C11 14.4001 11.4 14.0001 12 14.0001C12.6 14.0001 13 14.4001 13 15.0001C13 15.6001 12.6 16.0001 12 16.0001ZM13 11.0001C13 11.6001 12.6 12.0001 12 12.0001C11.4 12.0001 11 11.6001 11 11.0001V7.00011C11 6.40011 11.4 6.00011 12 6.00011C12.6 6.00011 13 6.40011 13 7.00011V11.0001Z" fill="#F67A28"></path>
                    </svg>
                </span>
                </div>
                <div class="w-full">
                <div class="flex">
                    <h3 class="text-orange-800 font-medium">` + title + `</h3>
                </div>
                <div class="pr-6">
                    <p class="text-sm text-orange-700">` + content + `</p>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>`;
    }
}

function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function getDateTime(timestamp) {
    dt = new Date(timestamp);
    MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    date = dt.getDate();
    if (date == 1) {
        date = "1st";
    } else if (date == 2) {
        date = "2nd";
    } else if (date == 3) {
        date = "3rd";
    } else if (date == 21) {
        date = "21st";
    } else if (date == 22) {
        date = "22nd";
    } else if (date == 23) {
        date = "23rd";
    } else if (date == 31) {
        date = "31st";
    } else {
        date = date + "th";
    }
    return pad(dt.getHours(), 2) + ":" + pad(dt.getMinutes(), 2) + ", " + MONTHS[dt.getMonth()] + " " + date + " " + dt.getFullYear();
}

function isNumber(n) {
    return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
}

// Calculates significant figures with suffixes K/M/B/T, e.g. 1234 = 1.23K
function sigfig(num, sigfigs_opt) {
    num = parseInt(num);
    flag = ""
    if (num < 0) flag = "-", num = -num;
    // Set default sigfigs to 3
    sigfigs_opt = (typeof sigfigs_opt === "undefined") ? 3 : sigfigs_opt;
    // Only assigns sig figs and suffixes for numbers > 1
    if (num <= 1) return num.toPrecision(sigfigs_opt);
    // Calculate for numbers > 1
    var power10 = log10(num);
    var power10ceiling = Math.floor(power10) + 1;
    // 0 = '', 1 = 'K', 2 = 'M', 3 = 'B', 4 = 'T'
    var SUFFIXES = ['', 'K', 'M', 'B', 'T'];
    // 100: power10 = 2, suffixNum = 0, suffix = ''
    // 1000: power10 = 3, suffixNum = 1, suffix = 'K'
    var suffixNum = Math.floor(power10 / 3);
    var suffix = SUFFIXES[suffixNum];
    // Would be 1 for '', 1000 for 'K', 1000000 for 'M', etc.
    var suffixPower10 = Math.pow(10, suffixNum * 3);
    var base = num / suffixPower10;
    var baseRound = base.toPrecision(sigfigs_opt);
    return flag + baseRound + suffix;
}

function log10(num) {
    // Per http://stackoverflow.com/questions/3019278/how-can-i-specify-the-base-for-math-log-in-javascript#comment29970629_16868744
    // Handles floating-point errors log10(1000) otherwise fails at (2.99999996)
    return (Math.round(Math.log(num) / Math.LN10 * 1e6) / 1e6);
}

function TSeparator(num) {
    num = parseInt(num);
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseMarkdown(markdownText) {
    const htmlText = markdownText
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
        .replace(/\*(.*)\*/gim, '<i>$1</i>')
        .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
        .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' style='text-decoration:underline' target='_blank'>$1</a>")
        .replace(/\n$/gim, '<br>')
        .replace(/  /gim, '<br>')

    return htmlText.trim()
}

RANKING = localStorage.getItem("rankname");
if (RANKING == null) {
    RANKING = [];
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/ranks",
        type: "GET",
        dataType: "json",
        success: function (data) {
            d = data.response;
            RANKING = {};
            for (i = 0; i < d.length; i++) {
                RANKING[parseInt(d[i]["distance"])] = d[i]["name"];
            }
            localStorage.setItem("rankname", JSON.stringify(RANKING));
        }
    });
} else {
    RANKING = JSON.parse(RANKING);
}

function point2rank(point) {
    point = parseInt(point);
    keys = Object.keys(RANKING);
    for (var i = 0; i < keys.length; i++) {
        if (point < keys[i]) {
            return RANKING[keys[i - 1]];
        }
    }
    return RANKING[keys[keys.length - 1]];
}

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
}

function b62decode(num62) {
    flag = 1;
    if (num62.startsWith("-")) {
        flag = -1;
        num62 = num62.slice(1);
    }
    ret = 0;
    l = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (i = 0; i < num62.length; i++) {
        ret += l.indexOf(num62[i]) * 62 ** (num62.length - i - 1);
    }
    return ret * flag;
}

function InitTable(table, reload_function, force_init = false){
    if($(table+"_paginate").length != 0 && !force_init) return;
    $(table+"_paginate").remove();
    table = table.replaceAll("#","");
    $("#"+table).after(`
    <br>
    <div id="${table}_paginate">
        <div style="margin-left:auto;width:fit-content">
            <div style="margin-left:auto;width:fit-content">
                <label class="text-sm font-medium mb-2" display="display:inline" for="">Page</label>
                <input id="${table}_page_input" style="width:50px;display:inline"
                    class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded pageinput"
                    name="field-name" rows="5" placeholder="" value="1"></input> / <span id="${table}_total_pages">-</span>
                <button type="button"
                    class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200" onclick="${reload_function}">Show</button>
            </div>
            <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="tmp=parseInt($('#${table}_page_input').val());$('#${table}_page_input').val(tmp-1);${reload_function};">
                < </button> <div id="${table}_paginate_control" style="display:inline"></div>
            <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200" onclick="tmp=parseInt($('#${table}_page_input').val());$('#${table}_page_input').val(tmp+1);${reload_function};">></button>
        </div>
    </div>`);
}

function TableNoData(columns) {
    var ret = "";
    for (var i = 0; i < columns - 1; i++)
        ret += `<td></td>`;
    return `<tr>
      <td style="color:#ccc"><i>No Data</i></td>
      ${ret}
    </tr>`
}

function PushTable(table, data, total_pages, reload_function = ""){
    page = parseInt($(table+"_page_input").val());
    column_count = $($(table+"_head").children()[0]).children().length;
    $(table+"_data").empty();

    if(data.length == 0){
        $(table+"_head").hide();
        $(table+"_data").append(TableNoData(column_count));
        $(table+"_page_input").val("1");
        return;
    } else {
        $(table+"_head").show();
    }

    if (page > total_pages) {
        $(table+"_page_input").val(1);
        return;
    }
    if (page <= 0) {
        $(table+"_page_input").val(1);
        page = 1;
    }

    $(table + "_total_pages").html(total_pages);
    $(table + "_paginate_control").children().remove();

    $(table + "_paginate_control").append(`
        <button type="button" style="display:inline"
        class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
        onclick="$('${table}_page_input').val(1);${reload_function}">1</button>`);
    if (page > 3) {
        $(table + "_paginate_control").append(`
        <button type="button" style="display:inline"
        class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
        >...</button>`);
    }
    for (var i = Math.max(page - 1, 2); i <= Math.min(page + 1, total_pages - 1); i++) {
        $(table + "_paginate_control").append(`
        <button type="button" style="display:inline"
        class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
        onclick="$('${table}_page_input').val(${i});${reload_function}">${i}</button>`);
    }
    if (page < total_pages - 2) {
        $(table + "_paginate_control").append(`
        <button type="button" style="display:inline"
        class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
        >...</button>`);
    }
    if (total_pages > 1) {
        $(table + "_paginate_control").append(`
        <button type="button" style="display:inline"
        class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
        onclick="$('${table}_page_input').val(${total_pages});${reload_function}">${total_pages}</button>`);
    }
    
    for(var i = 0 ; i < data.length ; i++){
        if(data[i][0].startsWith("<tr_style>")){
            s = data[i][0];
            s = s.substr(10,s.length-21);
            $(table+"_data").append(`<tr class="text-sm" style="${s}">`);
        } else {
            $(table+"_data").append(`<tr class="text-sm">`);
        }
        for(var j = 0 ; j < data[i].length ; j++){
            if(!data[i][j].startsWith("<tr_style>")){
                $(table+"_data").append(`<td class="py-5 px-6">${data[i][j]}</td>`);
            }
        }
        $(table+"_data").append(`</tr>`);
    }
}

$(document).ready(function () {
    version = localStorage.getItem("api-version");
    if (version != null) {
        $("#apiversion").html(version);
    }
    $.ajax({
        url: apidomain + "/" + vtcprefix,
        type: "GET",
        dataType: "json",
        success: function (data) {
            $("#apiversion").html(data.response.version);
            localStorage.setItem("api-version", data.response.version);
        }, error: function (data) {
            if(parseInt(data.status) >= 500 && parseInt(data.status) <= 599){
                toastFactory("error", "API seems to be offline", "This is usually due to an ongoing service reload. If it still doesn't work after a few minutes, please report the issue.", 5000, false);
            }
        }
    })
});

function sha256(ascii) {
    function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    };

    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length'
    var i, j; // Used as a counter across the whole file
    var result = ''

    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;

    //* caching results is optional - remove/add slash from front of this line to toggle
    // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
    // (we actually calculate the first 64, but extra values are just ignored)
    var hash = sha256.h = sha256.h || [];
    // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
    var k = sha256.k = sha256.k || [];
    var primeCounter = k[lengthProperty];
    /*/
    var hash = [], k = [];
    var primeCounter = 0;
    //*/

    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 313; i += candidate) {
                isComposite[i] = candidate;
            }
            hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
            k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        }
    }

    ascii += '\x80' // Append Ƈ' bit (plus zero padding)
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00' // More zero padding
    for (i = 0; i < ascii[lengthProperty]; i++) {
        j = ascii.charCodeAt(i);
        if (j >> 8) return; // ASCII check: only accept characters in range 0-255
        words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength)

    // process each chunk
    for (j = 0; j < words[lengthProperty];) {
        var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
        var oldHash = hash;
        // This is now the undefinedworking hash", often labelled as variables a...g
        // (we have to truncate as well, otherwise extra entries at the end accumulate
        hash = hash.slice(0, 8);

        for (i = 0; i < 64; i++) {
            var i2 = i + j;
            // Expand the message into 64 words
            // Used below if 
            var w15 = w[i - 15],
                w2 = w[i - 2];

            // Iterate
            var a = hash[0],
                e = hash[4];
            var temp1 = hash[7] +
                (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
                +
                ((e & hash[5]) ^ ((~e) & hash[6])) // ch
                +
                k[i]
                // Expand the message schedule if needed
                +
                (w[i] = (i < 16) ? w[i] : (
                    w[i - 16] +
                    (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) // s0
                    +
                    w[i - 7] +
                    (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10)) // s1
                ) | 0);
            // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
            var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
                +
                ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])); // maj

            hash = [(temp1 + temp2) | 0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
            hash[4] = (hash[4] + temp1) | 0;
        }

        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
        }
    }

    for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
            var b = (hash[i] >> (j * 8)) & 255;
            result += ((b < 16) ? 0 : '') + b.toString(16);
        }
    }
    return result;
};
