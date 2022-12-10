MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

logob64 = ""; 

lang = "";
enlang = "";
LANG_CODE = {
    'ar': 'Arabic',
    'be': 'Belarusian',
    'bg': 'Bulgarian',
    'cs': 'Czech',
    'cy': 'Welsh',
    'da': 'Danish',
    'de': 'German',
    'el': 'Greek',
    'en': 'English',
    'eo': 'Esperanto',
    'es': 'Spanish',
    'et': 'Estonian',
    'fi': 'Finnish',
    'fr': 'French',
    'ga': 'Irish',
    'gd': 'Scottish',
    'hu': 'Hungarian',
    'hy': 'Armenian',
    'id': 'Indonesian',
    'is': 'Icelandic',
    'it': 'Italian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'lt': 'Lithuanian',
    'lv': 'Latvian',
    'mk/sl': 'Macedonian',
    'mn': 'Mongolian',
    'mo': 'Moldavian',
    'ne': 'Nepali',
    'nl': 'Dutch',
    'nn': 'Norwegian',
    'pl': 'Polish',
    'pt': 'Portuguese',
    'ro': 'Romanian',
    'ru': 'Russian',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'sq': 'Albanian',
    'sr': 'Serbian',
    'sv': 'Swedish',
    'th': 'Thai',
    'tr': 'Turkish',
    'uk': 'Ukrainian',
    'vi': 'Vietnamese',
    'yi': 'Yiddish',
    'zh': 'Chinese'
};

function toDataURL(src, callback) {
    var xhttp = new XMLHttpRequest();

    xhttp.onload = function() {
        var fileReader = new FileReader();
        fileReader.onloadend = function() {
            callback(fileReader.result);
        }
        fileReader.readAsDataURL(xhttp.response);
    };

    xhttp.responseType = 'blob';
    xhttp.open('GET', src, true);
    xhttp.send();
}

$(document).ready(function () {
    drivershub = `    ____       _                         __  __      __  
   / __ \\_____(_)   _____  __________   / / / /_  __/ /_ 
  / / / / ___/ / | / / _ \\/ ___/ ___/  / /_/ / / / / __ \\
 / /_/ / /  / /| |/ /  __/ /  (__  )  / __  / /_/ / /_/ /
/_____/_/  /_/ |___/\\___/_/  /____/  /_/ /_/\\__,_/_.___/ 
                                                         `
    console.log(drivershub);
    console.log("Drivers Hub: Frontend (v2.4.7)");
    console.log('The official client side solution of "Drivers Hub: Backend" (© 2022 CharlesWithC)');
    console.log('CHub Website: https://drivershub.charlws.com/');
    console.log('Discord: https://discord.gg/KRFsymnVKm');
    console.log("Copyright © 2022 CharlesWithC All rights reserved.");

    $.ajax({
        url: "/languages/en.json?" + (+new Date()),
        type: "GET",
        dataType: "json",
        success: function (data) {
            enlang = data;
        }
    });
    if (language == "en") {
        lang = enlang;
    } else {
        $.ajax({
            url: "/languages/" + language + ".json?" + (+new Date()),
            type: "GET",
            dataType: "json",
            success: function (data) {
                lang = data;
            },
            error: function (data) {
                lang = enlang;
            }
        });
    }

    toDataURL("https://drivershub-cdn.charlws.com/assets/" + dhabbr + "/logo.png?v=2.4.6&key=" + logo_key, function(dataURL) {
        logob64 = dataURL
    });
});

function mltr(key) {
    key = key.toLowerCase();
    if (lang[key] == undefined) {
        if (enlang[key] == undefined) {
            return "";
        } else {
            return enlang[key];
        }
    } else {
        return lang[key];
    }
}

function convertQuotation1(s) {
    return s.replaceAll(`'`, `\\\'`);
}

function convertQuotation2(s) {
    return s.replaceAll(`"`, `\\\"`);
}

function sortDictWithValue(dict) {
    var items = Object.keys(dict).map(function (key) {
        return [key, dict[key]];
    });

    // Sort the array based on the second element
    items.sort(function (first, second) {
        return second[1] - first[1];
    });

    return items;
}

function ParseAjaxError(data) {
    return JSON.parse(data.responseText).descriptor ? JSON.parse(data.responseText).descriptor : data.status + " " + data.statusText;
}

function AjaxError(data, no_notification = false) {
    errmsg = ParseAjaxError(data);
    if (!no_notification) toastNotification("error", "Error", errmsg, 5000, false);
    console.warn(`API Request Failed: ${errmsg}\n<i class="fa-solid fa-folder-open"></i>:`);
    console.warn(data);
}

function GetMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

function OrdinalSuffix(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

function RandomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function RandomB32String(length) {
    var result = '';
    var characters = 'ABCDEFGHIJLKMNOPQRSTUVWXYZ234567';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
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
    } else src = logob64;
    return src;
}

function GetAvatarImg(src, userid, name) {
    return `<a style="cursor:pointer" onclick="LoadUserProfile(${userid})">
        <img src="${src}" style="width:20px;height:20px;border-radius:100%;display:inline" onerror="if($(this).attr('src')!=logob64) $(this).attr('src',logob64);">
        <b>${name}</b>
    </a>`;
}

function GetAvatar(userid, name, discordid, avatarid) {
    src = GetAvatarSrc(discordid, avatarid);
    return `<a style="cursor:pointer" onclick="LoadUserProfile(${userid})">
        <img src="${src}" style="width:20px;height:20px;border-radius:100%;display:inline" onerror="if($(this).attr('src')!=logob64) $(this).attr('src',logob64);">
        ${name}
    </a>`;
}

function CopyBannerURL(userid) {
    navigator.clipboard.writeText("https://" + window.location.hostname + "/banner/" + userid);
    return toastNotification("success", "Success", mltr("banner_url_copied_to_clipboard"), 5000)
}

function CopyButton(element, text) {
    navigator.clipboard.writeText(text);
    $(element).html("Copied!");
    setTimeout(function () {
        $(element).html("Copy");
    }, 1000);
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

function FileURLOutput(filename, src){
    var xhttp = new XMLHttpRequest();

    xhttp.onload = function() {
        var fileReader = new FileReader();
        fileReader.onloadend = function() {
            var element = document.createElement('a');
            element.setAttribute('href', fileReader.result);
            element.setAttribute('download', filename);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
        fileReader.readAsDataURL(xhttp.response);
    };

    xhttp.onerror = function(){
        toastNotification("error", "Error", "Error " + xhttp.status + ": " + xhttp.statusText, 5000);
    };

    xhttp.responseType = 'blob';
    xhttp.open('GET', src, true);
    xhttp.send();
}

function isJSONNumber(obj) {
    return obj !== undefined && obj !== null && obj.constructor == Number;
}

function isString(obj) {
    return obj !== undefined && obj !== null && obj.constructor == String;
}

window.btnvals = {};

function LockBtn(btnid, btntxt = mltr("working")) {
    if ($(btnid).attr("disabled") == "disabled") return;
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

function toastNotification(type, title, text, time = 5000) {
    new Noty({
        type: type,
        layout: 'topRight',
        text: text,
        timeout: time,
        theme: "mint"
    }).show();
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

function SafeParse(e) {
    if (e == undefined) return undefined;
    try {
        return JSON.parse(e);
    } catch {
        return undefined;
    }
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
    for (var i = 0; i < num62.length; i++) {
        ret += l.indexOf(num62[i]) * 62 ** (num62.length - i - 1);
    }
    return ret * flag;
}

function InitPaginate(element, reload_function, force_init = false) {
    if ($(element + "_paginate").length != 0 && !force_init) return;
    $(element + "_paginate").remove();
    element = element.replaceAll("#", "");
    $("#" + element).after(`
    <div style="margin-left:auto;width:fit-content;display:none;">
        <label class="text-sm font-medium mb-2" display="display:inline" for="">Page</label>
        <input id="${element}_page_input" style="width:50px;display:inline"
            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded pageinput"
            name="field-name" rows="5" placeholder="" value="1"></input> / <span id="${element}_total_pages">-</span>
        <button type="button"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200" onclick="${reload_function}">Show</button>
    </div>
    <ul id="${element}_paginate" class="pagination" style="margin-left:auto;width:fit-content">
        <li class="page-item disabled">
            <a class="page-link bg-dark text-white" style="cursor:pointer" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>

        <li class="page-item disabled">
            <a class="page-link bg-dark text-white" style="cursor:pointer">
                ...
            </a>
        </li>

        <li class="page-item disabled">
            <a class="page-link bg-dark text-white" style="cursor:pointer" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    </ul>`);
}

function UpdatePaginate(element, total_pages, reload_function = "") {
    page = parseInt($(element + "_page_input").val());

    if (page > total_pages) {
        $(element + "_page_input").val(1);
        return;
    }
    if (page <= 0) {
        $(element + "_page_input").val(1);
        page = 1;
    }

    $(element + "_total_pages").html(total_pages);
    $(element + "_paginate").children().remove();

    disable_previous = "";
    if (page <= 1) disable_previous = "disabled";

    disable_next = "";
    if (page >= total_pages) disable_next = "disabled";

    $(element + "_paginate").append(`
    <li class="page-item ${disable_previous}">
        <a class="page-link bg-dark text-white" style="cursor:pointer" aria-label="Previous" onclick="tmp=parseInt($('${element}_page_input').val());$('${element}_page_input').val(tmp-1);${reload_function};">
            <span aria-hidden="true">&laquo;</span>
        </a>
    </li>`);
    $(element + "_paginate").append(`
        <li class="page-item"><a class="page-link bg-dark text-white" style="cursor:pointer" onclick="$('${element}_page_input').val(1);${reload_function}">1</a></li>`);
    if (page > 3) {
        $(element + "_paginate").append(`
        <li class="page-item disabled"><a class="page-link bg-dark text-white" style="cursor:pointer">...</a></li>`);
    }
    for (var i = Math.max(page - 1, 2); i <= Math.min(page + 1, total_pages - 1); i++) {
        $(element + "_paginate").append(`
        <li class="page-item"><a class="page-link bg-dark text-white" style="cursor:pointer" onclick="$('${element}_page_input').val(${i});${reload_function}">${i}</a></li>`);
    }
    if (page < total_pages - 2) {
        $(element + "_paginate").append(`
        <li class="page-item disabled"><a class="page-link bg-dark text-white" style="cursor:pointer">...</a></li>`);
    }
    if (total_pages > 1) {
        $(element + "_paginate").append(`
        <li class="page-item"><a class="page-link bg-dark text-white" style="cursor:pointer" onclick="$('${element}_page_input').val(${total_pages});${reload_function}">${total_pages}</a></li>`);
    }
    $(element + "_paginate").append(`
    <li class="page-item ${disable_next}">
        <a class="page-link bg-dark text-white" style="cursor:pointer" aria-label="Next" onclick="tmp=parseInt($('${element}_page_input').val());$('${element}_page_input').val(tmp+1);${reload_function};">
            <span aria-hidden="true">&raquo;</span>
        </a>
    </li>`);
}

function PushTable(table, data, total_pages, reload_function = "") {
    UpdatePaginate(table, total_pages, reload_function);

    $(table + "_data").empty();

    if (data.length == 0) {
        $(table + "_head").hide();
        $(table + "_data").append(`<tr><td style="color:#ccc"><i>No Data</i></td>`);
        $(table + "_page_input").val("1");
        UpdatePaginate(table, 1, reload_function);
        return;
    } else {
        $(table + "_head").show();
    }

    for (var i = 0; i < data.length; i++) {
        res = "";
        if (data[i][0].startsWith("<tr_style>")) {
            s = data[i][0];
            s = s.substr(10, s.length - 21);
            res += `<tr style="${s}">`;
        } else {
            res += `<tr>`;
        }
        for (var j = 0; j < data[i].length; j++) {
            if (!data[i][j].startsWith("<tr_style>")) {
                res += `<td>${data[i][j]}</td>`;
            }
        }
        res += `</tr>`;
        $(table + "_data").append(res);
    }
}

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

function ShowModal(title, content, footer = `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("close")}</button>`) {
    modalid = RandomString(6);
    $("body").append(`<div id="modal-${modalid}" class="modal fade" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-dark text-white">
                <div class="modal-header" style="border:none">
                    <h5 class="modal-title"><strong>${title}</strong></h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer" style="border:none">
                    ${footer}
                </div>
            </div>
        </div>
    </div>
    `);
    return modalid;
}

function InitModal(name, modalid, top = false) {
    DestroyModal(name, immediately = true);
    modalName2ID[name] = modalid;
    modals[name] = new bootstrap.Modal('#modal-' + modalid);
    modals[name].show();
    $("#modal-" + modalid).on('hidden.bs.modal', function () {
        modals[name].dispose();
        $("#modal-" + modalid).remove();
        delete modals[name];
    })
    if (top) {
        $("#modal-" + modalid).css("z-index", "1060");
        $($("#modal-" + modalid).nextAll(".modal-backdrop")[0]).css("z-index", "1059");
    }
}

function DestroyModal(name, immediately = false) {
    if (Object.keys(modals).includes(name)) {
        if (!immediately) {
            modals[name].hide();
            setTimeout(function () {
                modals[name].dispose();
                $("#modal-" + modalName2ID[name]).remove();
                delete modals[name];
                delete modalName2ID[name];
            }, 1000);
        } else {
            modals[name].dispose();
            $("#modal-" + modalName2ID[name]).remove();
            delete modals[name];
            delete modalName2ID[name];
        }
    }
}

function GenCard(title, content) {
    return `
    <div class="shadow p-3 m-3 mt-0 bg-dark rounded col card">
        <h5 class="card-title"><strong>${title}</strong></h5>
        <p class="card-text">${content}</p>
    </div>`;
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function getFormattedDate(date, prefomattedDate = false, hideYear = false) {
    const day = date.getDate();
    const month = MONTH_NAMES[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    let minutes = date.getMinutes();

    if (minutes < 10) {
        // Adding leading zero to minutes
        minutes = `0${ minutes }`;
    }

    if (prefomattedDate) {
        // Today at 10:20
        // Yesterday at 10:20
        return `${ prefomattedDate } at ${ hours }:${ minutes }`;
    }

    if (hideYear) {
        // January 10. at 10:20
        return `${ month } ${ OrdinalSuffix(day) } at ${ hours }:${ minutes }`;
    }

    // January 10. 2017. at 10:20
    return `${ month } ${ OrdinalSuffix(day) } ${ year } at ${ hours }:${ minutes }`;
}


// --- Main function
function timeAgo(dateParam) {
    if (!dateParam) {
        return null;
    }

    const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
    const DAY_IN_MS = 86400000; // 24 * 60 * 60 * 1000
    const today = new Date();
    const yesterday = new Date(today - DAY_IN_MS);
    const seconds = Math.round((today - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const isToday = today.toDateString() === date.toDateString();
    const isYesterday = yesterday.toDateString() === date.toDateString();
    const isThisYear = today.getFullYear() === date.getFullYear();


    if (seconds < 5) {
        return mltr('now');
    } else if (seconds < 60) {
        return `${ seconds } ${mltr('sec_ago')}`;
    } else if (seconds < 90) {
        return mltr('about_a_min_ago');
    } else if (minutes < 60) {
        return `${ minutes } ${mltr('min_ago')}`;
    } else if (isToday) {
        return getFormattedDate(date, mltr('today')); // Today at 10:20
    } else if (isYesterday) {
        return getFormattedDate(date, mltr('yesterday')); // Yesterday at 10:20
    } else if (isThisYear) {
        return getFormattedDate(date, false, true); // 10. January at 10:20
    }

    return getFormattedDate(date); // 10. January 2017. at 10:20
}

function foregroundColorOf(color) {
    // Variables for red, green, blue values
    var r, g, b, hsp;

    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {

        // If RGB --> store the red, green, blue values in separate variables
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

        r = color[1];
        g = color[2];
        b = color[3];
    } else {

        // If hex --> Convert it to RGB: http://gist.github.com/983661
        color = +("0x" + color.slice(1).replace(
            color.length < 5 && /./g, '$&$&'));

        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
    }

    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(
        0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
    );

    // Using the HSP value, determine whether the color is light or dark
    if (hsp > 127.5) {
        return 'black';
    } else {
        return 'white';
    }
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function removeCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
audit_log_placeholder_row = `
<tr>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:60%;"><span class="placeholder w-100"></span></td>
</tr>`;

function LoadAuditLog(noplaceholder = false) {
    if (!noplaceholder) {
        $("#table_audit_log_data").children().remove();
        for (i = 0; i < 30; i++) {
            $("#table_audit_log_data").append(audit_log_placeholder_row);
        }
    }

    staff_userid = -1;
    if ($("#input-audit-log-staff").val() != "") {
        s = $("#input-audit-log-staff").val();
        staff_userid = s.substr(s.lastIndexOf("(") + 1, s.lastIndexOf(")") - s.lastIndexOf("(") - 1);
    }

    operation = $("#input-audit-log-operation").val();

    InitPaginate("#table_audit_log", "LoadAuditLog();")
    page = parseInt($("#table_audit_log_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    LockBtn("#button-audit-log-staff-search", "...");

    $.ajax({
        url: api_host + "/" + dhabbr + "/audit?page=" + page + "&operation=" + operation + "&staff_userid=" + staff_userid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-audit-log-staff-search");
            if (data.error) return AjaxError(data);

            auditLog = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < auditLog.length; i++) {
                audit = auditLog[i];
                dt = getDateTime(audit.timestamp * 1000);
                op = marked.parse(audit.operation).replaceAll("\n", "<br>").replaceAll("<p>", "").replaceAll("</p>", "").slice(0, -1);

                data.push([`${audit.user.name}`, `${dt}`, `${op}`]);
            }

            PushTable("#table_audit_log", data, total_pages, "LoadAuditLog();");
        },
        error: function (data) {
            UnlockBtn("#button-audit-log-staff-search");
            AjaxError(data);
        }
    })
}

configData = {};
backupConfig = {};
custom_application = undefined;
custom_style = undefined;

function LoadConfiguration() {
    $.ajax({
        url: api_host + "/" + dhabbr + "/config",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            configData = data.response.config;
            backupConfig = data.response.backup;

            $("#json-config").val(JSON.stringify(configData, null, 4,
                (_, value) =>
                typeof value === 'number' && value > 1e10 ?
                BigInt(value) :
                value));
        },
        error: function (data) {
            AjaxError(data);
        }
    });

    web_host = api_host.replaceAll("https://", "https://web.");
    $.ajax({
        url: web_host + "/" + dhabbr + "/config?domain=" + window.location.hostname,
        type: "GET",
        dataType: "json",
        success: function (data) {
            if (data.error) return AjaxError(data);
            webConfigData = data.response.config;
            $("#web-name").val(webConfigData.name);
            $("#web-distance-unit-"+webConfigData.distance_unit).prop("checked", true);
            $("#web-navio-company-id").val(webConfigData.navio_company_id);
            $("#web-slogan").val(webConfigData.slogan);
            $("#web-color").val(webConfigData.color);
        },
        error: function (data) {
            AjaxError(data);
        }
    });

    $('#web-custom-application').on('change', function () {
        var fileReader = new FileReader();
        fileReader.onload = function () {
            if(!fileReader.result.startsWith("data:text/html")){
                $('#web-custom-application').val("");
                custom_application = undefined;
                return toastNotification("error", "Error", mltr("you_must_selected_a_html_file"), 5000);
            }
            custom_application = atob(fileReader.result.replaceAll("data:text/html;base64,",""));
        };
        fileReader.readAsDataURL($('#web-custom-application').prop('files')[0]);
    });
    $('#web-custom-style').on('change', function () {
        var fileReader = new FileReader();
        fileReader.onload = function () {
            if(!fileReader.result.startsWith("data:text/css")){
                $('#web-custom-style').val("");
                custom_style = undefined;
                return toastNotification("error", "Error", mltr("you_must_selected_a_css_file"), 5000);
            }
            custom_style = atob(fileReader.result.replaceAll("data:text/css;base64,",""));
        };
        fileReader.readAsDataURL($('#web-custom-style').prop('files')[0]);
    });
}

function RevertConfig() {
    $("#json-config").val(JSON.stringify(backupConfig, null, 4,
        (_, value) =>
        typeof value === 'number' && value > 1e10 ?
        BigInt(value) :
        value));
    toastNotification("success", "Success", mltr("config_reverted_to_after_last_reload"), 5000);
}

function ResetConfig() {
    $("#json-config").val(JSON.stringify(configData, null, 4,
        (_, value) =>
        typeof value === 'number' && value > 1e10 ?
        BigInt(value) :
        value));
    toastNotification("success", "Success", mltr("config_reset_to_before_editing"), 5000);
}

function UpdateConfig() {
    config = $("#json-config").val();
    try {
        config = JSON.parse(config);
    } catch {
        return toastNotification("error", "Error", mltr("failed_to_parse_config_make_sure_its_in_correct_json_format"), 5000, false);
    }
    if (config["navio_api_token"] == "") delete config["navio_api_token"];
    if (config["discord_client_secret"] == "") delete config["discord_client_secret"];
    if (config["discord_bot_token"] == "") delete config["discord_bot_token"];
    LockBtn("#button-save-config", mltr("saving"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/config",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            config: JSON.stringify(config,
                (_, value) =>
                typeof value === 'number' && value > 1e10 ?
                BigInt(value) :
                value)
        },
        success: function (data) {
            UnlockBtn("#button-save-config");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", mltr("config_updated_reload_api_to_make_it_take_effect"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-save-config");
            AjaxError(data);
        }
    })
}

function ReloadAPIShow() {
    if (!mfaenabled) return toastNotification("error", "Error", mltr("mfa_must_be_enabled_to_reload_api"), 5000);
    mfafunc = ReloadServer;
    LockBtn("#button-reload-api-show", mltr("reloading"));
    setTimeout(function () {
        UnlockBtn("#button-reload-api-show");
        setTimeout(function () {
            ShowTab("#mfa-tab");
        }, 500);
    }, 1000);
}

function ReloadServer() {
    otp = $("#mfa-otp").val();
    $.ajax({
        url: api_host + "/" + dhabbr + "/reload",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            otp: otp
        },
        success: function (data) {
            reloadAPIMFA = false;
            ShowTab("#config-tab", "#button-config-tab");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", mltr("api_reloading"), 5000, false);
        },
        error: function (data) {
            reloadAPIMFA = false;
            ShowTab("#config-tab", "#button-config-tab");
            AjaxError(data);
        }
    })
}

function ResetCustomApplication(){
    LockBtn("#button-reset-custom-application", "...");
    
    $.ajax({
        url: "/default_application.html",
        type: "GET",
        success: function (data) {
            UnlockBtn("#button-reset-custom-application");
            custom_application = data;
            toastNotification("success", "Success", mltr("custom_application_reset_to_default"), 5000);
        },
        error: function (data) {
            UnlockBtn("#button-reset-custom-application");
            toastNotification("error", "Error", mltr("failed_to_reset_custom_application_unable_to_retrieve_default_application"), 5000);
        }
    })
}

function UpdateWebConfig() {
    LockBtn("#button-save-web-config", mltr("saving"));

    tipt = "";

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/tip",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            if (data.error) {
                UnlockBtn("#button-save-web-config");
                return AjaxError(data);
            }
            tipt = data.response.token;
            web_host = api_host.replaceAll("https://", "https://web.");
            $.ajax({
                url: web_host + "/" + dhabbr + "/config?domain=" + window.location.hostname + "&api_host=" + api_host,
                type: "PATCH",
                dataType: "json",
                headers: {
                    "Authorization": "TemporaryIdentityProof " + tipt
                },
                data: {
                    config: JSON.stringify({"name": $("#web-name").val(), "distance_unit": $("#web-distance-unit").find(":selected").attr("value"), "navio_company_id": $("#web-navio-company-id").val(), "slogan": $("#web-slogan").val(), "color": $("#web-color").val()}),
                    logo_url: $("#web-logo-download-link").val(),
                    banner_url: $("#web-banner-download-link").val(),
                    application: custom_application,
                    style: custom_style
                },
                success: function (data) {
                    UnlockBtn("#button-save-web-config");
                    if (data.error) return AjaxError(data);
                    toastNotification("success", "Success", mltr("web_config_updated"), 5000, false);
                },
                error: function (data) {
                    UnlockBtn("#button-save-web-config");
                    AjaxError(data);
                }
            })
        },
        error: function (data) {
            UnlockBtn("#button-save-web-config");
            return AjaxError(data);
        }
    });
}
dmapint = -1;
window.mapcenter = {}
window.autofocus = {}

function LoadDriverLeaderStatistics() {
    function AjaxLDLS(start, end, dottag) {
        $.ajax({
            url: api_host + "/" + dhabbr + "/dlog/leaderboard?start_time=" + start + "&end_time=" + end + "&page=1&page_size=1&point_types=distance",
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                users = data.response.list;
                dottuser = users[0];
                discordid = dottuser.user.discordid;
                avatar = GetAvatarSrc(discordid, dottuser.user.avatar);
                distance = TSeparator(parseInt(dottuser.points.distance * distance_ratio));
                $("#dot" + dottag).html(GetAvatarImg(src, dottuser.user.userid, dottuser.user.name));
                $("#dot" + dottag + "distance").html(`(${distance}${distance_unit_txt})`);
            }
        });
    }
    driver_of_the_tag = ["d", "w"];
    for (var i = 0; i < driver_of_the_tag.length; i++) {
        dott = driver_of_the_tag[i];
        var start = new Date();
        if (dott == "d") start = new Date();
        else if (dott == "w") start = GetMonday(new Date());
        start.setHours(0, 0, 0, 0);
        start = +start + start.getTimezoneOffset() * 60000;
        start /= 1000;
        var end = +new Date() / 1000;
        start = parseInt(start);
        end = parseInt(end);
        AjaxLDLS(start, end, dott);
    }
}

leaderboard_placeholder_row = `
<tr>
    <td style="width:5%;"><span class="placeholder w-100"></span></td>
    <td style="width:15%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
</tr>`;

function LoadLeaderboard(noplaceholder = false) {
    LockBtn("#button-leaderboard-options-update", btntxt = "...");

    page_size = parseInt($("#leaderboard-page-size").val());
    if (!isNumber(page_size)) page_size = 20;

    if (!noplaceholder) {
        $("#table_leaderboard_data").children().remove();
        for (i = 0; i < page_size; i++) {
            $("#table_leaderboard_data").append(leaderboard_placeholder_row);
        }
    }

    InitPaginate("#table_leaderboard", "LoadLeaderboard();");
    page = parseInt($("#table_leaderboard_page_input").val())
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    var start_time = -1,
        end_time = -1;
    if ($("#leaderboard-start-time").val() != "" && $("#leaderboard-end-time").val() != "") {
        start_time = +new Date($("#leaderboard-start-time").val()) / 1000;
        end_time = +new Date($("#leaderboard-end-time").val()) / 1000 + 86400;
    }

    speedlimit = parseInt($("#leaderboard-speed-limit").val());
    if (!isNumber(speedlimit)) speedlimit = 0; // make sure speedlimit is valid
    speedlimit /= distance_ratio; // convert to km/h

    game = 0;
    dets2 = $("#leaderboard-ets2").is(":checked");
    dats = $("#leaderboard-ats").is(":checked");
    if (dets2 && !dats) game = 1;
    else if (!dets2 && dats) game = 2;
    else if (!dets2 && !dats) game = -1;
    if (!dets2 && !dats) start_time = 1, end_time = 2;

    ldistance = $("#leaderboard-distance").is(":checked");
    lchallenge = $("#leaderboard-challenge").is(":checked");
    levent = $("#leaderboard-event").is(":checked");
    ldivision = $("#leaderboard-division").is(":checked");
    lmyth = $("#leaderboard-myth").is(":checked");
    limittype = ""
    if (ldistance == 1) limittype += "distance,";
    if (lchallenge == 1) limittype += "challenge,";
    if (levent == 1) limittype += "event,";
    if (ldivision == 1) limittype += "division,";
    if (lmyth == 1) limittype += "myth,";
    limittype = limittype.slice(0, -1);

    userstxt = $("#input-leaderboard-search").val();
    userst = userstxt.split(",");
    users = [];
    for (var i = 0; i < userst.length; i++) {
        s = userst[i];
        users.push(s.substr(s.lastIndexOf("(") + 1, s.lastIndexOf(")") - s.lastIndexOf("(") - 1));
    }
    users = users.join(",");

    $.ajax({
        url: api_host + "/" + dhabbr + "/dlog/leaderboard?page=" + page + "&page_size=" + page_size + "&speed_limit=" + parseInt(speedlimit) + "&start_time=" + start_time + "&end_time=" + end_time + "&game=" + game + "&point_types=" + limittype + "&userids=" + users,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-leaderboard-options-update");
            if (data.error) return AjaxError(data);

            leaderboard = data.response.list;
            total_pages = data.response.total_pages;
            data = [];
            for (i = 0; i < leaderboard.length; i++) {
                user = leaderboard[i];
                trstyle = "<tr_style></tr_style>";
                if(user.user.userid == localStorage.getItem("userid")) trstyle = "<tr_style>background-color:#444;</tr_style>";
                distance = TSeparator(parseInt(user.points.distance * distance_ratio));
                data.push([trstyle, `${TSeparator(user.points.rank)}`, `${GetAvatar(user.user.userid, user.user.name, user.user.discordid, user.user.avatar)}`, `${point2rank(parseInt(user.points.total_no_limit))} (#${TSeparator(user.points.rank_no_limit)})`, `${distance}`, `${TSeparator(user.points.challenge)}`, `${TSeparator(user.points.event)}`, `${TSeparator(user.points.division)}`, `${TSeparator(user.points.myth)}`, `${TSeparator(user.points.total)}`]);
            }
            PushTable("#table_leaderboard", data, total_pages, "LoadLeaderboard();");
        },
        error: function (data) {
            UnlockBtn("#button-leaderboard-options-update");
            AjaxError(data);
        }
    })
}

dlog_placeholder_row = `
<tr>
    <td style="width:5%;"><span class="placeholder w-100"></span></td>
    <td style="width:15%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
</tr>`;

function LoadDeliveryList(noplaceholder = false) {
    LockBtn("#button-delivery-log-options-update", btntxt = "...");

    page_size = parseInt($("#delivery-log-page-size").val());
    if (!isNumber(page_size)) page_size = 20;

    if (!noplaceholder) {
        $("#table_delivery_log_data").children().remove();
        for (i = 0; i < page_size; i++) {
            $("#table_delivery_log_data").append(dlog_placeholder_row);
        }
    }

    InitPaginate("#table_delivery_log", "LoadDeliveryList();");
    page = parseInt($("#table_delivery_log_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    var start_time = -1,
        end_time = -1;
    if ($("#delivery-log-start-time").val() != "" && $("#delivery-log-end-time").val() != "") {
        start_time = +new Date($("#delivery-log-start-time").val()) / 1000;
        end_time = +new Date($("#delivery-log-end-time").val()) / 1000 + 86400;
    }

    speedlimit = parseInt($("#delivery-log-speed-limit").val());
    if (!isNumber(speedlimit)) speedlimit = 0; // make sure speedlimit is valid
    speedlimit /= distance_ratio; // convert to km/h

    game = 0;
    dets2 = $("#delivery-log-ets2").is(":checked");
    dats = $("#delivery-log-ats").is(":checked");
    if (dets2 && !dats) game = 1;
    else if (!dets2 && dats) game = 2;
    else if (!dets2 && !dats) game = -1;
    if (!dets2 && !dats) start_time = 1, end_time = 2;

    status = 0;
    delivered = $("#delivery-log-delivered").is(":checked");
    cancelled = $("#delivery-log-cancelled").is(":checked");
    if (delivered && !cancelled) status = 1;
    else if (!delivered && cancelled) status = 2;

    division = parseInt($("#delivery-log-division-id").val());
    if (!isNumber(division)) division = "include";

    challenge = parseInt($("#delivery-log-challenge-id").val());
    if (!isNumber(challenge)) challenge = "include";

    uid = parseInt($("#delivery-log-userid").val());
    if (!isNumber(uid) || uid < 0) {
        uid = "";
    } else {
        uid = "&userid=" + uid;
    }

    $.ajax({
        url: api_host + "/" + dhabbr + "/dlog/list?page=" + page + "&speed_limit=" + parseInt(speedlimit) + "&start_time=" + start_time + "&end_time=" + end_time + "&game=" + game + "&page_size=" + page_size + "&division=" + division + "&challenge=" + challenge + "&status=" + status + uid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-delivery-log-options-update");
            if (data.error) return AjaxError(data);

            deliverylist = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < deliverylist.length; i++) {
                delivery = deliverylist[i];
                user = delivery.user;
                distance = TSeparator(parseInt(delivery.distance * distance_ratio));
                cargo_mass = parseInt(delivery.cargo_mass / 1000) + "t";
                unittxt = "€";
                if (delivery.unit == 2) unittxt = "$";
                profit = TSeparator(delivery.profit);
                color = "";
                if (delivery.profit < 0) color = "grey";
                dextra = "";
                if (delivery.division.divisionid != undefined) dextra = `<span title='${mltr("validated_division_delivery")}'>` + SVG_VERIFIED + "</span>";

                dloguser = GetAvatar(user.userid, user.name, user.discordid, user.avatar);
                if ($("#delivery-log-userid").val() == localStorage.getItem("userid")) dloguser = "Me";
                bgclr = "";
                if(user.userid == localStorage.getItem("userid")) bgclr = "background-color:#444;";
                data.push([`<tr_style>color:${color};${bgclr}</tr_style>`, `${delivery.logid} ${dextra}`, `${dloguser}`, `${delivery.source_company}, ${delivery.source_city}`, `${delivery.destination_company}, ${delivery.destination_city}`, `${distance}${distance_unit_txt}`, `${delivery.cargo} (${cargo_mass})`, `${unittxt}${profit}`, `<a class="clickable" onclick="ShowDeliveryDetail('${delivery.logid}')"><i class="fa-solid fa-folder-open"></i></a>`]);
            }

            PushTable("#table_delivery_log", data, total_pages, "LoadDeliveryList();");
        },
        error: function (data) {
            UnlockBtn("#button-delivery-log-options-update");
            AjaxError(data);
        }
    })
}

function ShowDeliveryLogExport() {
    modalid = ShowModal(mltr("export_delivery_log"), `
        <p>${mltr("export_delivery_log_note")}</p>
        <p><i>${mltr("export_delivery_log_rate_limit")}</i></p>
        <label class="form-label">${mltr("date_range")}</label>
        <div class="input-group mb-2">
            <span class="input-group-text">${mltr("from")}</span>
            <input type="date" class="form-control bg-dark text-white" id="delivery-log-export-start-time">
        </div>
        <div class="input-group mb-2">
            <span class="input-group-text">${mltr("to")}</span>
            <input type="date" class="form-control bg-dark text-white" id="delivery-log-export-end-time">
        </div>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("cancel")}</button><button id="button-delivery-log-export" type="button" class="btn btn-primary" onclick="DeliveryLogExport();">${mltr("export")}</button>`);
    InitModal("delivery_log_export", modalid);
}

function DeliveryLogExport() {
    var start_time = -1,
        end_time = -1;
    if ($("#delivery-log-export-start-time").val() != "" && $("#delivery-log-export-end-time").val() != "") {
        start_time = +new Date($("#delivery-log-export-start-time").val()) / 1000;
        end_time = +new Date($("#delivery-log-export-end-time").val()) / 1000 + 86400;
    }
    LockBtn("#button-delivery-log-export", mltr("exporting"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/dlog/export",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            start_time: start_time,
            end_time: end_time
        },
        success: function (data) {
            UnlockBtn("#button-delivery-log-export");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", mltr("delivery_log_exported"), 5000);
            FileOutput("export.csv", data);
        },
        error: function (data) {
            UnlockBtn("#button-delivery-log-export");
            AjaxError(data);
        }
    })
}

deliveryRoute = [];
rri = 0;
rrspeed = 10;
rrevents = [];
punit = "€";
curlogid = -1;
async function DeliveryRoutePlay() {
    if (window.dn == undefined || window.dn.previousExtent_ == undefined) return toastNotification("error", "Error", mltr("please_zoom__drag_the_map_to_activate_it"), 5000, false);
    clearInterval(dmapint);
    dmapint = -999;
    lastevent = 0;
    window.mapcenter["dmap"] = [deliveryRoute[0][0], -deliveryRoute[0][1]];
    prew = 0;
    preh = 0;
    pred = 0;
    pret = 0;
    for (; rri < deliveryRoute.length; rri += Math.max(rrspeed - 50, 1)) {
        if (rrspeed <= 0) rrspeed = 1;
        if (rri < 0) rri = 0;
        if (rri >= deliveryRoute.length) rri = deliveryRoute.length - 1;
        window.mapcenter["dmap"] = [deliveryRoute[rri][0], -deliveryRoute[rri][1]];
        $("#delivery-detail-progress").css("width", (rri / deliveryRoute.length * 100).toFixed(4) + "%");
        $("#delivery-detail-progress").attr("aria-valuenow", (rri / deliveryRoute.length * 100).toFixed(4));
        dmapw = $("#dmap").width();
        dmaph = $("#dmap").height();
        if (prew != dmapw || preh != dmaph) {
            prew = dmapw;
            preh = dmaph;
            $(".dmap-player").remove();
            RenderPoint("dmap", 0, dmaph / 2, dmapw / 2, 5, nodetail = true, truckicon = true);
        }
        if (rri + 1 < deliveryRoute.length) {
            vx = Math.round((deliveryRoute[rri + 1][0] - deliveryRoute[rri][0]) * 100) / 100;
            vy = Math.round((deliveryRoute[rri + 1][1] - deliveryRoute[rri][1]) * 100) / 100;
            degree = Math.atan(vy / vx) / Math.PI * 180;
            if (!(vx == 0 && vy == 0)) {
                $(".dmap-player").css("rotate", parseInt(degree) + "deg");
                pred = degree;
                if (deliveryRoute[rri + 1][0] - deliveryRoute[rri][0] < 0) {
                    $(".dmap-player").css("transform", "scaleX(-1)");
                    pret = 1;
                } else {
                    $(".dmap-player").css("transform", "");
                    pret = 0;
                }
            } else {
                $(".dmap-player").css("rotate", parseInt(pred) + "deg");
                if (pret) {
                    $(".dmap-player").css("transform", "scaleX(-1)");
                } else {
                    $(".dmap-player").css("transform", "");
                }
            }
        } else {
            $(".dmap-player").css("rotate", parseInt(pred) + "deg");
            if (pret) {
                $(".dmap-player").css("transform", "scaleX(-1)");
            } else {
                $(".dmap-player").css("transform", "");
            }
        }

        x = deliveryRoute[Math.min(rri + 10, deliveryRoute.length - 1)][0];
        z = deliveryRoute[Math.min(rri + 10, deliveryRoute.length - 1)][1];
        for (var i = lastevent; i < rrevents.length; i++) {
            ex = rrevents[i].location.x;
            ez = rrevents[i].location.z;
            // distance of (x,z) and (ex,ez) <= 50, use euclid distance
            if (Math.sqrt(Math.pow(x - ex, 2) + Math.pow(z - ez, 2)) <= 50) {
                lastevent = i + 1;
                if (document.getElementById('delivery-detail-timeline-' + i) != null) {
                    document.getElementById('delivery-detail-timeline-' + i).scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'center'
                    });
                    $(".blink").removeClass("blink");
                    $('#delivery-detail-timeline-' + i).addClass("blink");
                }
            }
        }

        await sleep(500 / rrspeed);

        while (dmapint != -999) {
            await sleep(500);
            rri -= 1;
        }
    }

    $("#delivery-route-control").remove();
    $("#delivery-detail-progress").css("width", "100%");
    $("#delivery-detail-progress").attr("aria-valuenow", "100");
    setTimeout(function () {
        $(".dmap-player").remove();
        window.mapcenter["dmap"] = undefined;
        dmapint = setInterval(UpdateDeliveryRoutePoints, 500);
    }, 5000);
}

function ToggleRouteReplay() {
    if (window.dn == undefined || window.dn.previousExtent_ == undefined) return toastNotification("error", "Error", mltr("please_zoom__drag_the_map_to_activate_it"), 5000, false);
    if (dmapint == -999) {
        dmapint = -2;
        $("#truck-svg").hide();
        $("#delivery-detail-route-replay-toggle").html(`<i class="fa-solid fa-play"></i>`);
    } else {
        $("#truck-svg").show();
        $("#delivery-detail-route-replay-toggle").html(`<i class="fa-solid fa-pause"></i>`);
        DeliveryRoutePlay();
    }
}

deliveryDetailTabPlaceholder = `
<div class="m-3">
    <h3 style="display:inline-block"><strong><span id="delivery-detail-title"><span class="placeholder" style="width:150px"></span></span></strong></h3>
    <h3 style="float:right"><span id="delivery-detail-user"><span class="placeholder" style="width:100px"></span></span></h3>
</div>
<div class="row m-3">
    <div class="shadow p-3 bg-dark rounded col-3" style="text-align:center">
        <p style="font-size:25px;margin-bottom:0;"><b><span id="delivery-detail-source-company"><span class="placeholder col-8"></span></span></b></p>
        <p><span id="delivery-detail-source-city" style="font-size:15px;color:#aaa"><span class="placeholder col-4"></span></span></p>
    </div>
    <div class="col-6 m-auto" style="text-align:center">
        <p style="font-size:15px;margin-bottom:0;"><span id="delivery-detail-cargo"><span class="placeholder col-6"></span></span></p>
        <div class="progress" style="height:5px;margin:5px;">
            <div id="delivery-detail-progress" class="progress-bar progress-bar-striped" role="progressbar" style="width:0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <p style="font-size:15px;margin-bottom:0;"><span id="delivery-detail-distance"><span class="placeholder col-8"></span></span></p>
    </div>
    <div class="shadow p-3 bg-dark rounded col-3" style="text-align:center">
        <p style="font-size:25px;margin-bottom:0;"><b><span id="delivery-detail-destination-company"><span class="placeholder col-8"></span></span></b></p>
        <p><span id="delivery-detail-destination-city" style="font-size:15px;color:#aaa"><span class="placeholder col-4"></span></span></p>
    </div>
</div>
<div class="row m-3" style="height:500px">
    <div id="dmap" class="col-8 h-100" style="background-color:#484E66;padding:0;border-radius:5px">
    </div>
    <div class="col-4" style="padding-right:0;">
        <div id="delivery-detail-timeline-div" class="shadow p-5 bg-dark rounded" style="height:500px;overflow:auto;">
            <ul class="timeline" id="delivery-detail-timeline">
                <li class="timeline-item timeline-white mb-5">
                    <h5 class="fw-bold"><span class="placeholder" style="width:100px"></span></h5>
                    <p class="text-muted mb-2 fw-bold"><span class="placeholder" style="width:40px"></span></p>
                    <p><span class="placeholder" style="width:120px"></span></p>
                </li>
                <li class="timeline-item timeline-white mb-5">
                    <h5 class="fw-bold"><span class="placeholder" style="width:100px"></span></h5>
                    <p class="text-muted mb-2 fw-bold"><span class="placeholder" style="width:40px"></span></p>
                    <p><span class="placeholder" style="width:120px"></span></p>
                </li>
            </ul>
        </div>
    </div>
</div>`;

function UpdateDeliveryRoutePoints() {
    if (window.dn == undefined || window.dn.previousExtent_ == undefined) return;
    window.dmapRange = {};
    dmapRange["top"] = window.dn.previousExtent_[3];
    dmapRange["left"] = window.dn.previousExtent_[0];
    dmapRange["bottom"] = window.dn.previousExtent_[1];
    dmapRange["right"] = window.dn.previousExtent_[2];
    $(".dmap-player").remove();
    dmapxl = dmapRange["left"];
    dmapxr = dmapRange["right"];
    dmapyt = dmapRange["top"];
    dmapyb = dmapRange["bottom"];
    dmapw = $("#dmap").width();
    dmaph = $("#dmap").height();
    dscale = (dmapxr - dmapxl) / $("#dmap").width();
    ddpoints = dpoints;
    if (dscale >= 150 && i % 300 != 0) ddpoints = dpoints150;
    else if (dscale >= 30 && i % 100 != 0) ddpoints = dpoints30;
    else if (dscale >= 20 && i % 50 != 0) ddpoints = dpoints20;
    else if (dscale >= 10 && i % 10 != 0) ddpoints = dpoints10;
    for (var i = 0; i < ddpoints.length; i++) {
        x = ddpoints[i][0];
        z = -ddpoints[i][1];
        if (x > dmapxl && x < dmapxr && z > dmapyb && z < dmapyt) {
            rx = (x - dmapxl) / (dmapxr - dmapxl) * dmapw;
            rz = (z - dmapyt) / (dmapyb - dmapyt) * dmaph;
            RenderPoint("dmap", 0, rz, rx, 5, nodetail = true);
        }
    }
}

currentDeliveryLog = {};

function ShowDeliveryDetail(logid) {
    $(".tabs").hide();
    $("#delivery-detail-tab").html(deliveryDetailTabPlaceholder);
    $("#delivery-detail-tab").show();

    curlogid = logid;
    window.autofocus["dmap"] = -2;
    rri = 0;
    rrspeed = 10;
    $.ajax({
        url: api_host + "/" + dhabbr + "/dlog?logid=" + String(logid),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            if (data.error) {
                ShowTab("#delivery-tab", "#button-delivery-tab");
                return AjaxError(data);
            }

            window.history.pushState("", "", '/delivery/' + logid);

            d = data.response.dlog;
            currentDeliveryLog = d;
            user = d.user;
            distance = TSeparator(parseInt(d.distance * distance_ratio)) + distance_unit_txt;
            delete_dlog = "";
            while(1){
                if(userPermLoaded) break;
                await sleep(100);
            }
            if(userPerm.includes("hrm") || userPerm.includes("delete_dlog") || userPerm.includes("admin")){
                delete_dlog = `<a class="clickable" onclick="DeleteDeliveryShow('${convertQuotation1(user.name)}', '${logid}')"><span class="rect-20" style="color:red"><i class="fa-solid fa-trash"></i></span></a>`;
            }
            $("#delivery-detail-title").html(`${mltr("delivery")} #${logid} <a class="clickable" onclick="MoreDeliveryDetail()"><span class="rect-20"><i class="fa-solid fa-circle-info"></i></span></a> ${delete_dlog}`);
            $("#delivery-detail-user").html(GetAvatar(user.userid, user.name, user.discordid, user.avatar));

            d = d.detail;
            tp = d.type;
            d = d.data.object;

            start_time = +new Date(d.start_time);
            stop_time = +new Date(d.stop_time);
            duration = "";
            if (start_time > 86400 * 1000) duration = String((stop_time - start_time) / 1000).toHHMMSS(); // in case start time is 19700101 and timezone

            cargo = d.cargo.name;
            cargo_mass = TSeparator(parseInt(d.cargo.mass * weight_ratio)) + weight_unit_txt;

            source_company = "N/A";
            source_city = "N/A";
            destination_company = "N/A";
            destination_city = "N/A";
            source_company_id = "";
            destination_company_id = "";
            if (d.source_company != null) source_company = d.source_company.name, source_company_id = d.source_company.unique_id;
            if (d.source_city != null) source_city = d.source_city.name;
            if (d.destination_company != null) destination_company = d.destination_company.name, destination_company_id = d.destination_company.unique_id;
            if (d.destination_city != null) destination_city = d.destination_city.name;

            $("#delivery-detail-source-company").html(source_company);
            $("#delivery-detail-source-city").html(source_city);
            $("#delivery-detail-destination-company").html(destination_company);
            $("#delivery-detail-destination-city").html(destination_city);
            $("#delivery-detail-cargo").html(`${cargo} (${cargo_mass})`);
            $("#delivery-detail-distance").html(`${distance}<br>${duration}`);

            punit = "€";
            if (!d.game.short_name.startsWith("e")) punit = "$";

            $("#delivery-detail-timeline").children().remove();
            ECOLOR = {
                "started": "green",
                "delivered": "green",
                "cancelled": "red",
                "fine": "yellow",
                "tollgate": "white",
                "ferry": "white",
                "train": "white",
                "collision": "yellow",
                "repair": "green",
                "refuel": "green",
                "teleport": "green",
                "speeding": "yellow"
            }

            function GenTimelineItem(e, idx, title, content) {
                $("#delivery-detail-timeline").append(`
                <li id="delivery-detail-timeline-${idx}" class="timeline-item timeline-${ECOLOR[e.type]} mb-5">
                    <h5 class="fw-bold">${title}</h5>
                    <p class="text-muted mb-2 fw-bold">${e.real_time}</p>
                    <p>${content}</p>
                </li>`);
            }

            rrevents = d.events;
            for (i = 0; i < rrevents.length; i++) {
                e = rrevents[i];
                meta = e.meta;
                if (e.type == "started") {
                    GenTimelineItem(e, i, mltr('job_started'), `${mltr("from")} ${source_company}, ${source_city}`);
                } else if (e.type == "delivered") {
                    GenTimelineItem(e, i, mltr('job_delivered'), `${mltr("to")} ${destination_company}, ${destination_city}<br>${mltr("earned")}  ${punit}${TSeparator(meta.revenue)} & ${TSeparator(meta.earned_xp)} XP`);
                } else if (e.type == "cancelled") {
                    GenTimelineItem(e, i, mltr('job_cancelled'), `${mltr("penalty")}: ${punit}${TSeparator(meta.penalty)}`);
                } else if (e.type == "fine") {
                    if (meta.offence == "crash") {
                        GenTimelineItem(e, i, mltr('crash'), `${mltr("fined")}: ${punit}${TSeparator(meta.amount)}`);
                    } else if (meta.offence == "speeding") {
                        speed = TSeparator(parseInt(meta.speed * 3.6 * distance_ratio)) + distance_unit_txt + "/h";
                        speed_limit = TSeparator(parseInt(meta.speed_limit * distance_ratio)) + distance_unit_txt + "/h";
                        GenTimelineItem(e, i, mltr('speeding'), `${mltr("speed")}: ${speed} | ${mltr("limit")}: ${speed_limit}<br>${mltr("fined")}: ${punit}${TSeparator(meta.amount)}`);
                    } else if (meta.offence == "wrong_way") {
                        GenTimelineItem(e, i, mltr('wrong_way'), `${mltr("fined")}: ${punit}${TSeparator(meta.amount)}`);
                    }
                } else if (e.type == "tollgate") {
                    GenTimelineItem(e, i, mltr('tollgate'), `${mltr("paid")} ${punit}${TSeparator(meta.cost)}`);
                } else if (e.type == "ferry") {
                    GenTimelineItem(e, i, mltr('ferry'), `${meta.source_name} -> ${meta.target_name}<br>Paid ${punit}${TSeparator(meta.cost)}`);
                } else if (e.type == "train") {
                    GenTimelineItem(e, i, mltr('train'), `${meta.source_name} -> ${meta.target_name}<br>Paid ${punit}${TSeparator(meta.cost)}`);
                } else if (e.type == "collision") {
                    damage = meta.wear_engine + meta.wear_chassis + meta.wear_transmission + meta.wear_cabin + meta.wear_wheels;
                    GenTimelineItem(e, i, mltr('collision'), `${mltr("truck_damage")}: ${(damage*100).toFixed(2)}%`);
                } else if (e.type == "repair") {
                    GenTimelineItem(e, i, mltr('repair'), mltr('truck_repaired'));
                } else if (e.type == "refuel") {
                    fuel = TSeparator(parseInt(meta.amount * fuel_ratio)) + fuel_unit_txt;
                    GenTimelineItem(e, i, mltr('refuel'), `${mltr("refueled")} ${fuel}.`);
                } else if (e.type == "teleport") {
                    GenTimelineItem(e, i, mltr('teleport'), mltr('teleported_to_another_location'));
                } else if (e.type == "speeding") {
                    speed = TSeparator(parseInt(meta.max_speed * 3.6 * distance_ratio)) + distance_unit_txt + "/h";
                    speed_limit = TSeparator(parseInt(meta.speed_limit * 3.6 * distance_ratio)) + distance_unit_txt + "/h";
                    GenTimelineItem(e, i, mltr('speeding'), `${mltr("speed")}: ${speed} | ${mltr("limit")}: ${speed_limit}<br>${mltr("duration")}: ${meta.end-meta.start} sec<br><i>${mltr("not_fined")}</i>`);
                }
            }
            new SimpleBar($("#delivery-detail-timeline-div")[0]);
            document.getElementById('delivery-detail-timeline-0').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
            $("html, body").animate({
                scrollTop: 0
            }, "fast");

            dt = getDateTime(data.response.timestamp * 1000);

            telemetry = data.response.dlog.telemetry.split(";");
            basic = telemetry[0].split(",");
            tver = 1;
            if (basic[0].startsWith("v2")) tver = 2;
            else if (basic[0].startsWith("v3")) tver = 3;
            else if (basic[0].startsWith("v4")) tver = 4;
            else if (basic[0].startsWith("v5")) tver = 5;
            else if (basic[0].startsWith("v")) {
                $("#dmap").prepend(`
                <div style="position:absolute;z-index:10;padding:10px;">
                    <h5>${mltr('delivery_route')} <span style="color:red">${mltr('not_available')}</span></h5>
                    <p style="font-size:12px">${mltr('delivery_route_not_available_note')}</p>
                </div>`);
                return;
            }
            basic[0] = basic[0].slice(2);
            game = basic[0];
            mods = basic[1];
            route = telemetry.slice(1);
            dpoints = [];
            lastx = 0;
            lastz = 0;
            if (tver <= 4) {
                for (i = 0; i < route.length; i++) {
                    if (tver == 4) {
                        if (route[i].split(",") == 1 && route[i].startsWith("idle")) {
                            idlecnt = parseInt(route[i].split("e")[1]);
                            for (var j = 0; j < idlecnt; j++) {
                                dpoints.push([lastx, lastz]);
                            }
                            continue;
                        }
                    }
                    p = route[i].split(",");
                    if (p.length < 2) continue;
                    if (tver == 1) dpoints.push([p[0], p[2]]); // x, z
                    else if (tver == 2) dpoints.push([b62decode(p[0]), b62decode(p[1])]);
                    else if (tver >= 3) {
                        relx = b62decode(p[0]);
                        relz = b62decode(p[1]);
                        dpoints.push([lastx + relx, lastz + relz]);
                        lastx = lastx + relx;
                        lastz = lastz + relz;
                    }
                }
            } else if (tver == 5) {
                nroute = "";
                for (i = 0; i < route.length; i++) {
                    nroute += route[i] + ";";
                }
                route = nroute;
                for (var i = 0, j = 0; i < route.length; i++) {
                    x = route[i];
                    if (x == "^") {
                        for (j = i + 1; j < route.length; j++) {
                            if (route[j] == "^") {
                                c = parseInt(route.substr(i + 1, j - i - 1));
                                for (k = 0; k < c; k++) {
                                    dpoints.push([lastx, lastz]);
                                }
                                break;
                            }
                        }
                        i = j;
                    } else if (x == ";") {
                        cx = 0;
                        cz = 0;
                        for (j = i + 1; j < route.length; j++) {
                            if (route[j] == ",") {
                                cx = route.substr(i + 1, j - i - 1);
                                break;
                            }
                        }
                        i = j;
                        for (j = i + 1; j < route.length; j++) {
                            if (route[j] == ";") {
                                cz = route.substr(i + 1, j - i - 1);
                                break;
                            }
                        }
                        i = j;
                        if (cx == 0 && cz == 0) {
                            continue;
                        }
                        relx = b62decode(cx);
                        relz = b62decode(cz);
                        dpoints.push([lastx + relx, lastz + relz]);
                        lastx = lastx + relx;
                        lastz = lastz + relz;
                    } else {
                        st = "ZYXWVUTSRQPONMLKJIHGFEDCBA0abcdefghijklmnopqrstuvwxyz";
                        if (i + 1 >= route.length) break;
                        z = route[i + 1];
                        relx = st.indexOf(x) - 26;
                        relz = st.indexOf(z) - 26;
                        dpoints.push([lastx + relx, lastz + relz]);
                        lastx = lastx + relx;
                        lastz = lastz + relz;
                        i += 1;
                    }
                }
            }
            minx = 100000000000000;
            for (i = 0; i < dpoints.length; i++) {
                if (dpoints[i][0] < minx) minx = dpoints[i][0];
            }
            $("#dmap").children().remove();
            window.dn = {};
            window.mapcenter["dmap"] = undefined;
            if (game == 1 && (mods == "promod" || JSON.stringify(data.response).toLowerCase().indexOf("promod") != -1)) {
                LoadETS2PMap("dmap");
            } else if (game == 1) { // ets2
                LoadETS2Map("dmap");
            } else if (game == 2) { // ats
                LoadATSMap("dmap");
            } else {
                $("#dmap").prepend(`
                <div style="position:absolute;z-index:10;padding:10px;">
                    <h5>${mltr('delivery_route')} <span style="color:red">${mltr('not_available')}</span></h5>
                    <p style="font-size:12px">${mltr('delivery_route_not_available_note')}</p>
                </div>`);
                return;
            }
            $("#dmap").prepend(`
            <div style="position:absolute;z-index:10;padding:10px;">
                <h5>Delivery Route</h5>
                <div id="delivery-route-control">
                    <a class="clickable" onclick="rrspeed-=2"><i class="fa-solid fa-minus"></i></a>
                    <a class="clickable" onclick="rri-=100"><i class="fa-solid fa-backward"></i></a>&nbsp;&nbsp;
                    <a class="clickable" onclick="ToggleRouteReplay()" id="delivery-detail-route-replay-toggle"><i class="fa-solid fa-play"></i></a>&nbsp;&nbsp;
                    <a class="clickable" onclick="rri+=100"><i class="fa-solid fa-forward"></i></a>
                    <a class="clickable" onclick="rrspeed+=2"><i class="fa-solid fa-plus"></i></a>
                </div>
            </div>`);
            deliveryRoute = dpoints;
            $("#rp_tot").html(deliveryRoute.length);
            dpoints150 = dpoints.filter(function (el, i) {
                return i % 300 == 0;
            });
            dpoints30 = dpoints.filter(function (el, i) {
                return i % 100 == 0;
            });
            dpoints20 = dpoints.filter(function (el, i) {
                return i % 50 == 0;
            });
            dpoints10 = dpoints.filter(function (el, i) {
                return i % 10 == 0;
            });
            dpoints = dpoints.filter(function (el, i) {
                return i % 5 == 0;
            });
            window.dn = {};
            if (dmapint != -1) clearInterval(dmapint);
            dmapint = setInterval(UpdateDeliveryRoutePoints, 500);
        },
        error: function (data) {
            ShowTab("#delivery-tab", "#button-delivery-tab");
            AjaxError(data);
        }
    });
}

function DeleteDeliveryShow(name, logid) {
    modalid = ShowModal(mltr('delete_delivery'), `<p>${mltr('delete_delivery_note_1')}</p><p><i>#${logid} (${name})</i></p><br><p>${mltr('delete_delivery_note_2')}</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-delete-delivery" type="button" class="btn btn-danger" onclick="DeleteDelivery('${logid}');">${mltr('delete')}</button>`);
    InitModal("delete_delivery", modalid);
}

function DeleteDelivery(logid){
    LockBtn("#button-delete-delivery", mltr("deleting"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/dlog?logid="+logid,
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-delete-delivery");
            if (data.error) return AjaxError(data);
            LoadDeliveryList(noplaceholder=true);
            toastNotification("success", "Success", mltr("delivery_deleted"), 5000, false);
            DestroyModal("delete_delivery");
        },
        error: function (data) {
            UnlockBtn("#button-delete-delivery");
            AjaxError(data);
        }
    })
}

function MoreDeliveryDetail() {
    function GenTableRow(key, val) {
        return `<tr><td><b>${key}</b></td><td>${val}</td></tr>\n`;
    }
    d = currentDeliveryLog;
    info = "<table>";
    distance = TSeparator(parseInt(d.distance * distance_ratio)) + distance_unit_txt;
    distance_org = d.distance;

    start_time = +new Date(d.start_time);
    stop_time = +new Date(d.stop_time);
    duration = "N/A";
    if (start_time > 86400 * 1000) duration = String((stop_time - start_time) / 1000).toHHMMSS(); // in case start time is 19700101 and timezone
    if (d.detail.type == "job.delivered") {
        t = d.detail.data.object;
        auto_park = t.events[t.events.length - 1].meta.auto_park;
        auto_load = t.events[t.events.length - 1].meta.auto_load;
        extra = "";
        if (auto_park == "1") extra += `<span class="badge text-bg-primary">${mltr("auto_park")}</span>&nbsp;&nbsp;`;
        if (auto_load == "1") extra += `<span class="badge text-bg-primary">${mltr("auto_load")}</span>`;
        info += GenTableRow(mltr("log_id"), d.logid + "&nbsp;&nbsp;" + extra);
    } else {
        info += GenTableRow(mltr("log_id"), d.logid);
    }
    info += GenTableRow(mltr("navio_id"), d.detail.data.object.id);
    info += GenTableRow(mltr("time_submitted"), getDateTime(d.timestamp * 1000));
    info += GenTableRow(mltr("time_spent"), duration);
    isdelivered = false;
    if (d.detail.type == "job.delivered") {
        isdelivered = true;
        info += GenTableRow(mltr("status"), `<span style='color:lightgreen'>${mltr("delivered")}</span>`);
    } else if (d.detail.type == "job.cancelled") {
        info += GenTableRow(mltr("status"), `<span style='color:red'>${mltr("cancelled")}</span>`);
    }
    if (d.telemetry != "") {
        info += GenTableRow(mltr("delivery_route"), `<span style='color:lightgreen'>${mltr("available")}</span>`);
    } else {
        info += GenTableRow(mltr("delivery_route"), `<span style='color:red'>${mltr("unavailable")}</span>`);
    }
    info += GenTableRow(mltr("division"), `<span id="delivery-detail-division"><button id="button-delivery-detail-division" type="button" class="btn btn-primary"  onclick="GetDivisionInfo(${d.logid});">${mltr("check")}</button></span>`);

    info += GenTableRow("&nbsp;", "&nbsp;");
    info += GenTableRow(mltr("driver"), GetAvatar(d.user.userid, d.user.name, d.user.discordid, d.user.avatar));

    d = d.detail.data.object;

    source_company = "N/A";
    source_city = "N/A";
    destination_company = "N/A";
    destination_city = "N/A";
    source_company_id = "";
    destination_company_id = "";
    if (d.source_company != null) source_company = d.source_company.name, source_company_id = d.source_company.unique_id;
    if (d.source_city != null) source_city = d.source_city.name;
    if (d.destination_company != null) destination_company = d.destination_company.name, destination_company_id = d.destination_company.unique_id;
    if (d.destination_city != null) destination_city = d.destination_city.name;
    info += GenTableRow(mltr("source_company"), `${source_company} <span style="color:grey">(${source_company_id})</span>`);
    info += GenTableRow(mltr("source_city"), `${source_city} <span style="color:grey">(${d.source_city.unique_id})</span>`);
    info += GenTableRow(mltr("destination_company"), `${destination_company} <span style="color:grey">(${destination_company_id})</span>`);
    info += GenTableRow(mltr("destination_city"), `${destination_city} <span style="color:grey">(${d.destination_city.unique_id})</span>`);
    info += GenTableRow(mltr("logged_distance"), distance);
    if (isdelivered) {
        distance2 = d.events[d.events.length - 1].meta.distance;
        distance2_org = d.events[d.events.length - 1].meta.distance
        distance2 = TSeparator(parseInt(distance2 * distance_ratio)) + distance_unit_txt;
        info += GenTableRow(mltr("reported_distance"), distance2);
        revenue = TSeparator(d.events[d.events.length - 1].meta.revenue);
    } else {
        penalty = TSeparator(d.events[d.events.length - 1].meta.penalty);
    }
    distance3 = d.planned_distance;
    distance3 = TSeparator(parseInt(distance3 * distance_ratio)) + distance_unit_txt;
    info += GenTableRow(mltr("planned_distance"), distance3);

    info += GenTableRow("&nbsp;", "&nbsp;");
    cargo = d.cargo.name;
    cargo_mass = TSeparator(parseInt(d.cargo.mass * weight_ratio)) + weight_unit_txt;
    info += GenTableRow(mltr("cargo"), `${cargo} <span style="color:grey">(${d.cargo.unique_id})</span>`);
    damage_color = "lightgreen";
    if (d.cargo.damage >= 0.03) damage_color = "yellow";
    if (d.cargo.damage >= 0.1) damage_color = "red";
    info += GenTableRow(mltr("cargo_mass"), cargo_mass);
    info += GenTableRow(mltr("cargo_damage"), `<span style="color:${damage_color}">${(d.cargo.damage * 100).toPrecision(2)}%`);
    truck = d.truck.brand.name + " " + d.truck.name;
    truck_brand_id = d.truck.brand.unique_id;
    license_plate = d.truck.license_plate;
    trailer = "";
    trs = "";
    if (d.trailers.length > 1) trs = "s";
    for (var i = 0; i < d.trailers.length; i++) trailer += d.trailers[i].license_plate + " | ";
    trailer = trailer.slice(0, -3);
    info += GenTableRow(mltr("truck"), truck);
    info += GenTableRow(mltr("truck_plate"), license_plate);
    info += GenTableRow(mltr("trailer_plate"), trailer);

    info += GenTableRow("&nbsp;", "&nbsp;");
    fuel_used_org = d.fuel_used;
    fuel_used = TSeparator(parseInt(d.fuel_used * fuel_ratio)) + fuel_unit_txt;
    info += GenTableRow(mltr("fuel"), fuel_used);
    if (isdelivered) {
        avg_fuel = TSeparator(parseInt((fuel_used_org * fuel_ratio) / (distance2_org * distance_ratio) * 100)) + fuel_unit_txt + "/100" + distance_unit_txt;
    } else {
        avg_fuel = TSeparator(parseInt((fuel_used_org * fuel_ratio) / (distance_org * distance_ratio) * 100)) + fuel_unit_txt + "/100" + distance_unit_txt;
    }
    info += GenTableRow(mltr("avg_fuel"), avg_fuel);
    info += GenTableRow(mltr("adblue"), d.adblue_used);
    top_speed = parseInt(d.truck.top_speed * 3.6 * distance_ratio) + distance_unit_txt + "/h";
    average_speed = parseInt(d.truck.average_speed * 3.6 * distance_ratio) + distance_unit_txt + "/h";
    info += GenTableRow(mltr("max_speed"), top_speed);
    info += GenTableRow(mltr("avg_speed"), average_speed);

    info += GenTableRow("&nbsp;", "&nbsp;");
    punit = "€";
    if (!d.game.short_name.startsWith("e")) punit = "$";
    offence = 0;
    for (var i = 0; i < d.events.length; i++) {
        if (d.events[i].type == "fine") {
            offence += parseInt(d.events[i].meta.amount);
        }
    }
    offence = -offence;
    offence = TSeparator(offence);
    if (isdelivered) {
        info += GenTableRow(mltr("revenue"), `${punit}${revenue}`);
    } else {
        info += GenTableRow(mltr("penalty"), `${punit}${penalty}`);
    }
    info += GenTableRow(mltr("offence"), `${punit}${offence}`);

    info += GenTableRow("&nbsp;", "&nbsp;");
    if (d.is_special == true) {
        info += GenTableRow(mltr("is_special_transport"), "<span style='color:lightgreen'>Yes</span>");
    } else {
        info += GenTableRow(mltr("is_special_transport"), "No");
    }
    if (d.is_late == true) {
        info += GenTableRow(mltr("is_late"), "<span style='color:red'>Yes</span>");
    } else {
        info += GenTableRow(mltr("is_late"), "<span style='color:lightgreen'>No</span>");
    }
    if (d.game.had_police_enabled == true) {
        info += GenTableRow(mltr("had_police_enabled"), "<span style='color:lightgreen'>Yes</span>");
    } else {
        info += GenTableRow(mltr("had_police_enabled"), "<span style='color:red'>No</span>");
    }

    MARKET = {
        "cargo_market": mltr("cargo_market"),
        "freight_market": mltr("freight_market"),
        "quick_job": mltr("quick_job"),
        "external_contracts": mltr("external_contracts")
    };
    mkt = mltr("unknown");
    if (Object.keys(MARKET).includes(d.market)) mkt = MARKET[d.market];
    info += GenTableRow(mltr("market"), mkt);
    mode = mltr("single_player");
    if (d.multiplayer != null) {
        mode = mltr("multiplayer");
        if (d.multiplayer.type == "truckersmp") {
            mode = mltr("truckersmp");
        } else if (d.multiplayer.type == "scs_convoy") {
            mode = mltr("scs_convoy");
        }
    }
    info += GenTableRow(mltr("mode"), mode);

    info += "</table>";

    modalid = ShowModal(mltr('delivery_log'), info);
    InitModal("delivery_log_detail", modalid);
}
function LoadXOfTheMonth(){
    if($("#member-tab-left").is(":visible")) return;
    if(perms.driver_of_the_month != undefined){
        dotm_role = perms.driver_of_the_month[0];
        
        $.ajax({
            url: api_host + "/" + dhabbr + "/member/list?page=1&page_size=1&roles=" + dotm_role,
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                d = data.response.list;
                user = d[0];
                userid = user.userid;
                name = user.name;
                discordid = user.discordid;
                avatar = GetAvatarSrc(discordid, user.avatar);
                $("#driver-of-the-month-info").html(`<img src="${avatar}" width="60%" style="border-radius:100%" onerror="if($(this).attr('src')!=logob64) $(this).attr('src',logob64);"><br><a style="cursor: pointer" onclick="LoadUserProfile(${userid})">${name}</a>`);
                $("#driver-of-the-month").show();

                $("#member-tab-left").show();
                $("#member-tab-right").addClass("col-8");
            }
        })
    }
    if(perms.staff_of_the_month != undefined){
        sotm_role = perms.staff_of_the_month[0];
        
        $.ajax({
            url: api_host + "/" + dhabbr + "/member/list?page=1&page_size=1&roles=" + sotm_role,
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                d = data.response.list;
                user = d[0];
                userid = user.userid;
                name = user.name;
                discordid = user.discordid;
                avatar = GetAvatarSrc(discordid, user.avatar);
                $("#staff-of-the-month-info").html(`<img src="${avatar}" width="60%" style="border-radius:100%" onerror="if($(this).attr('src')!=logob64) $(this).attr('src',logob64);"><br><a style="cursor: pointer" onclick="LoadUserProfile(${userid})">${name}</a>`);
                $("#staff-of-the-month").show();

                $("#member-tab-left").show();
                $("#member-tab-right").addClass("col-8");
            }
        })
    }
}

member_list_placeholder_row = `
<tr>
    <td style="width:40px;"></td>
    <td style="width:calc(100% - 40px - 60%);"><span class="placeholder w-100"></span></td>
    <td style="width:calc(100% - 40px - 40%);"><span class="placeholder w-100"></span></td>
</tr>`;
function LoadMemberList(noplaceholder = false) {
    LockBtn("#button-member-list-search", btntxt = "...");

    InitPaginate("#table_member_list", "LoadMemberList();");
    page = parseInt($("#table_member_list_page_input").val())
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    search_name = $("#input-member-search").val();

    if(!noplaceholder){
        $("#table_member_list_data").empty();
        for(var i = 0 ; i < 10 ; i++){
            $("#table_member_list_data").append(member_list_placeholder_row);
        }
    }

    $.ajax({
        url: api_host + "/" + dhabbr + "/member/list?page=" + page + "&order_by=highest_role&order=desc&name=" + search_name,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            UnlockBtn("#button-member-list-search");
            if (data.error) return AjaxError(data);
            while(1){
                if(userPermLoaded) break;
                await sleep(100);
            }

            memberList = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < memberList.length; i++) {
                user = memberList[i];
                userid = user.userid;
                name = user.name;
                discordid = user.discordid;
                avatar = user.avatar;
                cur_highestrole = rolelist[user.roles[0]];
                if (cur_highestrole == undefined) cur_highestrole = "/";
                if (avatar != null) {
                    if (avatar.startsWith("a_"))
                        src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif";
                    else
                        src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png";
                } else {
                    avatar = logob64;
                }
                userop = ``;
                if(userPerm.includes("hrm") || userPerm.includes("admin")){
                    userop = `<div class="dropdown">
                    <a class="dropdown-toggle clickable" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        ${mltr('manage')}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-dark">
                        <li><a class="dropdown-item clickable" onclick="EditRolesShow(${userid})">${mltr("roles")}</a></li>
                        <li><a class="dropdown-item clickable" onclick="EditPointsShow(${userid}, '${convertQuotation1(name)}')">${mltr("points")}</a></li>
                        <li><a class="dropdown-item clickable" onclick="UpdateUsername('${user.discordid}')">${mltr('refresh_username')}</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item clickable" style="color:red" onclick="DisableUserMFAShow('${discordid}', '${convertQuotation1(name)}')">${mltr('disable_mfa')}</a></li>
                        <li><a class="dropdown-item clickable" style="color:red" onclick="UpdateDiscordShow('${discordid}', '${convertQuotation1(name)}')">${mltr('update_discord_id')}</a></li>
                        <li><a class="dropdown-item clickable" style="color:red" onclick="DeleteConnectionsShow('${discordid}', '${convertQuotation1(name)}')">${mltr('delete_connections')}</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item clickable" style="color:red" onclick="DismissMemberShow(${userid}, '${convertQuotation1(name)}')" >${mltr('dismiss')}</a></li>
                    </ul>
                </div>`;
                } else if(userPerm.includes("hr")){
                    userop = `<div class="dropdown">
                    <a class="dropdown-toggle clickable" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        ${mltr('manage')}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-dark">
                        <li><a class="dropdown-item clickable" onclick="EditRolesShow(${userid})">${mltr('roles')}</a></li>
                        <li><a class="dropdown-item clickable" onclick="EditPointsShow(${userid}, '${convertQuotation1(name)}')">${mltr('points')}</a></li>
                        <li><a class="dropdown-item clickable" onclick="UpdateUsername('${user.discordid}')">${mltr('refresh_username')}</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item clickable" onclick="DismissMemberShow(${userid}, '${convertQuotation1(name)}')" style="color:red">${mltr('dismiss')}</a></li>
                    </ul>
                </div>`;
                } else if(userPerm.includes(`division`)){
                    userop = `<div class="dropdown">
                    <a class="dropdown-toggle clickable" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        ${mltr('manage')}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-dark">
                        <li><a class="dropdown-item clickable" onclick="EditRolesShow(${userid})">${mltr('roles')}</a></li>
                    </ul>
                </div>`;
                }
                data.push([`<img src='${src}' width="40px" height="40px" style="display:inline;border-radius:100%" onerror="if($(this).attr('src')!=logob64) $(this).attr('src',logob64);">`, `<a style="cursor: pointer" onclick="LoadUserProfile(${userid})">${name}</a>`, `${cur_highestrole}`, userop]);
            }

            PushTable("#table_member_list", data, total_pages, "LoadMemberList();");
        },
        error: function (data) {
            UnlockBtn("#button-member-list-search");
            AjaxError(data);
        }
    })
}

function EditRolesShow(uid){
    $.ajax({
        url: api_host + "/" + dhabbr + "/user?userid=" + uid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            d = data.response.user;
            roles = d.roles;

            roled = `
            <div>
                <label class="form-label">${mltr('roles')}</label>
                <br>
            </div>`;
            
            roleids = Object.keys(rolelist);
            if(!(userPerm.includes("hr") || userPerm.includes("hrm") || userPerm.includes("admin"))&&userPerm.includes("division")){
                division_roles = [];
                divisions_ids = Object.keys(divisions);
                for(var i = 0 ; i < divisions_ids.length ; i++){
                    division_roles.push(divisions[divisions_ids[i]].role_id);
                }
            }
            for (var i = 0; i < roleids.length; i++) {
                if(i>0&&i%2==0) roled += "<br>";
                checked = "";
                if(roles.includes(roleids[i])) checked = "checked";
                disabled = "";
                if (parseInt(roleids[i]) <= parseInt(highestroleid))
                    disabled = "disabled";
                if(!(userPerm.includes("hr") || userPerm.includes("hrm") || userPerm.includes("admin"))&&userPerm.includes("division")){
                    if(!division_roles.includes(roleids[i])) disabled="disabled";
                }
                roled += `
                <div class="form-check mb-2" style="width:49.5%;display:inline-block">
                    <input class="form-check-input" type="checkbox" value="" id="edit-roles-${roleids[i]}" name="edit-roles" ${checked} ${disabled}>
                    <label class="form-check-label" for="edit-roles-${roleids[i]}">
                        ${rolelist[roleids[i]]}
                    </label>
                </div>`;
            }
            
            modalid = ShowModal(`${d.name} (${d.userid})`, roled, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("close")}</button><button id="button-edit-roles" type="button" class="btn btn-primary" onclick="EditRoles(${d.userid});">${mltr("update")}</button>`);
            InitModal("edit_roles", modalid);
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

function EditRoles(uid) {
    LockBtn("#button-edit-roles", mltr("updating"));

    d = $('input[name="edit-roles"]:checked');
    roles = [];
    for (var i = 0; i < d.length; i++) {
        roles.push(d[i].id.replaceAll("edit-roles-", ""));
    }

    $.ajax({
        url: api_host + "/" + dhabbr + "/member/roles",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "userid": uid,
            "roles": roles.join(",")
        },
        success: function (data) {
            UnlockBtn("#button-edit-roles");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success!", mltr("member_roles_updated"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-edit-roles");
            AjaxError(data);
        }
    });
}

function EditPointsShow(uid, name){
    div = `
    <label class="form-label">${mltr('points')}</label>
    <div class="input-group mb-2">
        <span class="input-group-text" id="edit-points-distance-label">${mltr('distance')}</span>
        <input type="number" class="form-control bg-dark text-white" id="edit-points-distance" placeholder="0" aria-describedby="edit-points-distance-label">
    </div>
    <div class="input-group mb-3">
        <span class="input-group-text" id="edit-points-myth-label">${mltr('myth')}</span>
        <input type="number" class="form-control bg-dark text-white" id="edit-points-myth" placeholder="0" aria-describedby="edit-points-myth-label">
    </div>`;
    modalid = ShowModal(`${name} (${uid})`, div, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button><button id="button-edit-points" type="button" class="btn btn-primary" onclick="EditPoints(${uid});">${mltr('update')}</button>`);
    InitModal("edit_points", modalid);
}

function EditPoints(uid) {
    LockBtn("#button-edit-points");

    distance = $("#edit-points-distance").val();
    mythpoint = $("#edit-points-myth").val();
    if (!isNumber(distance)) distance = 0;
    if (!isNumber(mythpoint)) mythpoint = 0;
    
    $.ajax({
        url: api_host + "/" + dhabbr + "/member/point",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "userid": uid,
            "distance": distance,
            "mythpoint": mythpoint,
        },
        success: function (data) {
            UnlockBtn("#button-edit-points");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success!", mltr("member_points_updated"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-edit-points");
            AjaxError(data);
        }
    });
}

function DismissMemberShow(uid, name){
    if(uid == localStorage.getItem("userid")) return toastNotification("error", "Error", mltr("you_cannot_dismiss_yourself"), 5000);
    modalid = ShowModal(mltr('dismiss_member'), `<p>${mltr('dismiss_member_note_1')}</p><p><i>${name} (${mltr('user_id')}: ${uid})</i></p><br><p>${mltr("dismiss_member_note_2")}</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-dismiss-member" type="button" class="btn btn-danger" onclick="DismissMember(${uid});">${mltr('dismiss')}</button>`);
    InitModal("dismiss_member", modalid);
}

function DismissMember(uid){
    LockBtn("#button-dismiss-member", mltr("dismissing"));
    
    $.ajax({
        url: api_host + "/" + dhabbr + "/member/dismiss?userid=" + uid,
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-dismiss-member");
            if (data.error) return AjaxError(data);
            LoadMemberList(noplaceholder=true);
            toastNotification("success", "Success", mltr("member_dismissed"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-dismiss-member");
            AjaxError(data);
        }
    });
}

function LoadRanking(){
    $("#ranking-tab").children().remove();
    for(var i = 0 ; i < 3 ; i++){
        t = `<div class="row">`;
        for(var j = 0 ; j < 3 ; j++){
            t += GenCard(`<span class="placeholder" style="width:150px"></span>`, `<span class="placeholder" style="width:100px"></span>`);
        }
        t += `</div>`;
        $("#ranking-tab").append(t);
    }
    $.ajax({
        url: api_host + "/" + dhabbr + "/dlog/leaderboard?point_types=distance,challenge,event,division,myth&userids=" + localStorage.getItem("userid"),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            if (data.error) AjaxError(data);
            t = `<div class="row">`;
            $("#ranking-tab").children().remove();
            if(data.response.list.length != 0){
                d = data.response.list[0];
                rank = point2rank(d.points.total_no_limit);
                t += GenCard(mltr('my_points'), TSeparator(d.points.total_no_limit) + " - " + rank + `
                <button id="button-rankings-role" type="button" class="btn btn-sm btn-primary button-rankings-role" onclick="GetDiscordRankRole();" style="float:right">${mltr('get_discord_role')}</button>`);
            } else {
                t += GenCard(mltr('my_points'), mltr("you_are_not_a_driver"));
            }
            k = Object.keys(RANKING);
            for(var i = 0 ; i < Math.min(k.length, 2) ; i++){
                t += GenCard(`<span style="color:${RANKCLR[k[i]]}"> ${RANKING[k[i]]}</span>`, `${TSeparator(k[i])} Points`);
            }
            t += `</div>`;
            if(t.length>2){
                for(var i = 2, j = 2; i < k.length ; i = j){
                    t += `<div class="row">`;
                    for(j = i ; j < Math.min(k.length, i + 3) ; j++){
                        t += GenCard(`<span style="color:${RANKCLR[k[j]]}"> ${RANKING[k[j]]}</span>`, `${TSeparator(k[j])} Points`);
                    }
                    t += `</div>`;
                }
            }
            $("#ranking-tab").append(t);
        }, error: function(data){
            AjaxError(data);
        }
    });
}

user_statistics_placeholder = `<div class="row">
<div class="shadow p-3 m-3 bg-dark rounded col">
    <div style="padding:20px 0 0 20px;float:left" id="profile-info">
    </div>
    <div style="width:170px;padding:10px;float:right"><img id="profile-avatar" onerror="if($(this).attr('src')!=logob64) $(this).attr('src',logob64);" style="border-radius: 100%;width:150px;height:150px;border:solid ${dhcolor} 5px;">
    </div>
    <a style="cursor:pointer"><img id="profile-banner" onclick="CopyBannerURL(profile_userid)" onerror="$(this).hide();" style="border-radius:10px;width:100%;margin-top:10px;margin-bottom:20px;"></a>
</div>
<div class="shadow p-3 m-3 bg-dark rounded col-4">
    <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-user"></i></span> ${mltr('account')}</strong></h5>
    <div id="user-account-info"></div>
</div>
</div>
<div class="row">
<div class="shadow p-3 m-3 bg-dark rounded col">
    <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-chart-line"></i></span> ${mltr('statistics')}</strong></h5>
    <div style="float:right">
        <div class="btn-group" id="user-chart-scale-group">
            <a id="user-chart-scale-1" onclick='chartscale=1;LoadChart(profile_userid)' style="cursor:pointer" class="btn btn-primary" aria-current="page">24h</a>
            <a id="user-chart-scale-2" onclick='chartscale=2;LoadChart(profile_userid)' style="cursor:pointer" class="btn btn-primary">7d</a>
            <a id="user-chart-scale-3" onclick='chartscale=3;LoadChart(profile_userid)' style="cursor:pointer" class="btn btn-primary active">30d</a>
        </div>
        <a id="user-chart-sum" onclick='addup=1-addup;LoadChart(profile_userid)' style="cursor:pointer" class="btn btn-primary active">${mltr('sum')}</a>
    </div>
    </h2>
    <div class="p-4 overflow-x-auto" style="display: block;">
        <canvas id="user-statistics-chart" width="100%" height="300px"></canvas>
    </div>
</div>
<div class="shadow p-3 m-3 bg-dark rounded col-4">
    <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-align-left"></i></span> ${mltr('statistics')}</strong></h5>
    <div id="profile-text-statistics"></div>
</div>
</div>`;

function getActivityName(name){
    if(name.startsWith("dlog_")) return mltr("viewing_delivery_log") + " #" + name.split("_")[1];
    else if(name == "dlog") return mltr("viewing_delivery_logs");
    else if(name == "index") return mltr("viewing_drivers_hub_index");
    else if(name == "leaderboard") return mltr("viewing_leaderboard");
    else if(name == "member") return mltr("viewing_members");
    else if(name.includes("member_")) return mltr("viewing") + " " + allmembers[name.split("_")[1]] + "'s " + mltr("profile");
    else if(name == "announcement") return mltr("viewing_announcements");
    else if(name == "application") return mltr("viewing_appliactions");
    else if(name == "challenge") return mltr("viewing_challenges");
    else if(name == "division") return mltr("viewing_divisions");
    else if(name == "downloads") return mltr("viewing_downloads");
    else if(name == "event") return mltr("viewing_events");
    else return "/";
}

function getActitivyUrl(name){
    if(name.startsWith("dlog_")) return "/delivery/"+name.split("_")[1];
    else if(name == "dlog") return "/delivery";
    else if(name == "index") return "/";
    else if(name == "leaderboard") return "/leaderboard";
    else if(name == "member") return "/member";
    else if(name.includes("member_")) return "/member/"+name.split("_")[1];
    else if(name == "announcement") return "/announcement";
    else if(name == "application") return "/application/my";
    else if(name == "challenge") return "/challenge";
    else if(name == "division") return "/division";
    else if(name == "downloads") return "/downloads";
    else if(name == "event") return "/event";
    else return "/";
}

function UpdateUsername(discordid){
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/name",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: discordid
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            if(curtab == "#user-delivery-tab") LoadUserProfile(profile_userid);
            if(curtab == "#member-tab") LoadMemberList(noplaceholder = true);
            if(curtab == "#manage-user-tab") LoadUserList(noplaceholder = true);
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function LoadUserProfile(userid) {
    if (userid < 0) return;
    profile_userid = userid;

    $("#user-statistics").html(user_statistics_placeholder);
    $('#delivery-log-userid').val(userid);
    $("#profile-banner").attr("src", "/banner/" + userid);

    function GenTableRow(key, val) {
        return `<tr><td><b>${key}</b></td><td>${val}</td></tr>\n`;
    }

    $.ajax({
        url: api_host + "/" + dhabbr + "/user?userid=" + String(userid),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            if (data.error) {
                ShowTab("#overview-tab", "#button-overview-tab");
                return AjaxError(data);
            }

            ShowTab("#user-delivery-tab", userid);

            d = data.response.user;

            account_info = "<table>";
            account_info += GenTableRow(mltr("id"), d.userid);
            if (d.email != undefined && d.email != "") {
                account_info += GenTableRow(mltr("email"), d.email);
            } 
            account_info += GenTableRow(mltr("discord"), d.discordid);
            account_info += GenTableRow(mltr("truckersmp"), `<a href='https://truckersmp.com/user/${d.truckersmpid}'>${d.truckersmpid}</a>`);
            account_info += GenTableRow(mltr("steam"), `<a href='https://steamcommunity.com/profiles/${d.steamid}'>${d.steamid}</a>`);
            account_info += GenTableRow(mltr("joined_at"), getDateTime(d.join_timestamp * 1000));
            
            roles = d.roles;
            rtxt = "";
            for (var i = 0; i < roles.length; i++) {
                color = dhcolor;
                if(rolecolor[roles[i]] != undefined) color = rolecolor[roles[i]];
                fcolor = foregroundColorOf(color);
                rtxt += `<span class='badge' style='background-color:${color};color:${fcolor}'>` + rolelist[roles[i]] + "</span> ";
            }
            rtxt = rtxt.substring(0, rtxt.length - 2);
            
            if(d.roles.length == 1) account_info += GenTableRow(mltr("role"), rtxt);
            else account_info += GenTableRow(mltr("roles"), rtxt);
            
            account_info += GenTableRow("&nbsp;", "&nbsp;");
            activity_url = getActitivyUrl(d.activity.name);
            if(d.activity.name == "offline"){
                if(d.activity.last_seen != -1)
                    account_info += GenTableRow(mltr("status"), mltr("offline") + " - " + mltr("last_seen") + " " + timeAgo(new Date(d.activity.last_seen*1000)));
                else
                    account_info += GenTableRow(mltr("status"), mltr("offline"));
            }
            else if(d.activity.name == "online") account_info += GenTableRow(mltr("status"), mltr("online"));
            else account_info += GenTableRow(mltr("activity"), `<a class="clickable" onclick='window.history.pushState("", "", "${activity_url}");PathDetect()'>${getActivityName(d.activity.name)}</a>`);

            account_info += "</table>";

            $("#user-account-info").html(account_info);
            
            extra = "";
            
            while(1){
                if(userPermLoaded) break;
                await sleep(100);
            }
            if(userPerm.includes("hrm") || userPerm.includes("admin") || userPerm.includes("patch_username") || d.userid == localStorage.getItem("userid")){
                extra = `<button type="button" class="btn btn-primary" style="position:relative;top:-3px;" onclick="UpdateUsername('${d.discordid}');"><i class="fa-solid fa-rotate"></i></button>`;
            }

            profile_info = "";
            profile_info += `<h1 style='font-size:40px'><b>${d.name}</b> ${extra}</h1>`;
            profile_info += "" + marked.parse(d.bio);
            $("#profile-info").html(profile_info);
            
            avatar = GetAvatarSrc(d.discordid, d.avatar);
            $("#profile-avatar").attr("src", avatar);

            $("#profile-text-statistics").html("Loading...");
            $.ajax({
                url: api_host + "/" + dhabbr + "/dlog/statistics/summary?userid=" + String(userid),
                type: "GET",
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                success: async function (data) {
                    if (!data.error) {
                        d = data.response;
                        info = "";
                        info += `<b>${mltr('jobs')}</b>: ${TSeparator(d.job.all.sum.tot)} (${TSeparator(d.job.all.ets2.tot)} + ${TSeparator(d.job.all.ats.tot)})<br>`;
                        info += `<b>${mltr('including_cancelled_jobs')}</b>: ${TSeparator(d.job.cancelled.sum.tot)}<br>`;

                        dtot = TSeparator(d.distance.all.sum.tot * distance_ratio) + distance_unit_txt;
                        dets2 = TSeparator(d.distance.all.ets2.tot * distance_ratio) + distance_unit_txt;
                        dats = TSeparator(d.distance.all.ats.tot * distance_ratio) + distance_unit_txt;
                        info += `<b>${mltr('distance')}</b>: ${dtot} (${dets2} + ${dats})<br>`;

                        dtot = TSeparator(d.fuel.all.sum.tot * fuel_ratio) + fuel_unit_txt;
                        dets2 = TSeparator(d.fuel.all.ets2.tot * fuel_ratio) + fuel_unit_txt;
                        dats = TSeparator(d.fuel.all.ats.tot * fuel_ratio) + fuel_unit_txt;
                        info += `<b>${mltr('fuel')}</b>: ${dtot} (${dets2} + ${dats})<br>`;

                        info += `<b>${mltr('profit')}</b>: €` + TSeparator(d.profit.all.tot.euro) + " + $" + TSeparator(d.profit.all.tot.dollar) + "<br>";
                        info += `<b>${mltr('including_cancellation_penalty')}</b>: -€` + TSeparator(-d.profit.cancelled.tot.euro) + " - $" + TSeparator(-d.profit.cancelled.tot.dollar) + "";

                        $("#profile-text-statistics").html(info);

                        $.ajax({
                            url: api_host + "/" + dhabbr + "/dlog/leaderboard?point_types=distance,challenge,event,division,myth&userids=" + String(userid),
                            type: "GET",
                            dataType: "json",
                            headers: {
                                "Authorization": "Bearer " + localStorage.getItem("token")
                            },
                            success: async function (data) {
                                if (!data.error) {
                                    info += "<hr>";
                                    d = data.response.list[0];
                                    if(d != undefined){
                                        info += `<b>${mltr('points')}</b><br>`;
                                        info += `<b>${mltr('distance')}</b>: ${d.points.distance}<br>`;
                                        info += `<b>${mltr('challenge')}</b>: ${d.points.challenge}<br>`;
                                        info += `<b>${mltr('event')}</b>: ${d.points.event}<br>`;
                                        info += `<b>${mltr('division')}</b>: ${d.points.division}<br>`;
                                        info += `<b>${mltr('myth')}</b>: ${d.points.myth}<br>`;
                                        info += `<b>${mltr('total')}: ${d.points.total_no_limit}</b><br>`;
                                        info += `<b>${mltr('rank')}: #${d.points.rank_no_limit} (${point2rank(d.points.total_no_limit)})</b><br>`;
                                    }
                                    info += `</p>`;
                                    $("#profile-text-statistics").html(info);
                                }
                            }
                        });
                    }
                },
                error: function (data) {
                    AjaxError(data, no_notification = true);
                }
            });
        },
        error: function (data) {
            ShowTab("#overview-tab", "#button-overview-tab");
            AjaxError(data);
        }
    });
}

function GetDiscordRankRole() {
    LockBtn(".button-rankings-role", mltr("getting"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/member/roles/rank",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn(".button-rankings-role");
            if (data.error) return AjaxError(data);
            else return toastNotification("success", "Success", mltr("discord_role_assigned"), 5000, false);
        },
        error: function (data) {
            UnlockBtn(".button-rankings-role");
            AjaxError(data);
        }
    })
}
sc = undefined;
chartscale = 3;
addup = 1;

async function LoadChart(userid = -1) {
    if (userid != -1) {
        $("#user-chart-scale-group").children().removeClass("active");
        $("#user-chart-scale-"+chartscale).addClass("active");
        if(!addup) $("#user-chart-sum").removeClass("active");
        else $("#user-chart-sum").addClass("active");
    } else {
        $("#overview-chart-scale-group").children().removeClass("active");
        $("#overview-chart-scale-"+chartscale).addClass("active");
        if(!addup) $("#overview-chart-sum").removeClass("active");
        else $("#overview-chart-sum").addClass("active");
    }
    pref = "s";
    if (userid != -1) pref = "user-s";
    $.ajax({
        url: api_host + "/" + dhabbr + "/dlog/statistics/chart?scale=" + chartscale + "&sum_up=" + addup + "&userid=" + userid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            d = data.response;
            const ctx = document.getElementById(pref + 'tatistics-chart').getContext('2d');
            labels = [];
            distance = [];
            fuel = [];
            euro = [];
            dollar = [];
            for (i = 0; i < d.length; i++) {
                ts = d[i].start_time;
                ts = new Date(ts * 1000);
                if (chartscale == 1) { // 24h
                    ts = pad(ts.getHours(), 2) + ":" + pad(ts.getMinutes(), 2);
                } else if (chartscale >= 2) { // 7 d / 30 d
                    ts = MONTH_ABBR[ts.getMonth()] + " " + OrdinalSuffix(ts.getDate());
                }
                labels.push(ts);
                if (d[i].distance == 0) {
                    distance.push(NaN);
                    fuel.push(NaN);
                    euro.push(NaN);
                    dollar.push(NaN);
                    continue;
                }
                distance.push(parseInt(parseInt(d[i].distance) * distance_ratio));
                fuel.push(parseInt(d[i].fuel));
                euro.push(parseInt(d[i].profit.euro));
                dollar.push(parseInt(d[i].profit.dollar));
            }
            const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;
            const config = {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Distance (' + distance_unit_txt + ')',
                        data: distance,
                        borderColor: "lightgreen",
                        cubicInterpolationMode: 'monotone',
                        segment: {
                            borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)'),
                            borderDash: ctx => skipped(ctx, [6, 6]),
                        },
                        spanGaps: true,
                        xAxisID: 'x',
                        yAxisID: 'y',
                        type: 'line'
                    }, {
                        label: 'Fuel (L)',
                        data: fuel,
                        borderColor: "orange",
                        cubicInterpolationMode: 'monotone',
                        segment: {
                            borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)'),
                            borderDash: ctx => skipped(ctx, [6, 6]),
                        },
                        spanGaps: true,
                        xAxisID: 'x',
                        yAxisID: 'y',
                        type: 'line'
                    }, {
                        label: 'Profit (€)',
                        data: euro,
                        backgroundColor: "skyblue",
                        xAxisID: 'x1',
                        yAxisID: 'y1'
                    }, {
                        label: 'Profit ($)',
                        data: dollar,
                        backgroundColor: "pink",
                        xAxisID: 'x1',
                        yAxisID: 'y1'
                    }, ]
                },
                showTooltips: true,
                options: {
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false
                    },
                    radius: 0,
                    scales: {
                        x: {
                            display: false
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                        },
                        x1: {
                            stacked: true,
                        },
                        y1: {
                            display: true,
                            position: 'right',
                            stacked: true,

                            grid: {
                                drawOnChartArea: false,
                            },
                        },
                    }
                }
            };
            if (sc != undefined) {
                sc.destroy();
                $(pref + 'tatistics-chart').remove();
            }
            sc = new Chart(ctx, config);
        }
    });
}

deliveryStatsChart = undefined;

function refreshStats(){
    stats_start_time = parseInt(+ new Date() / 1000 - 86400);
    stats_end_time = parseInt(+ new Date() / 1000);
    if ($("#stats_start").val() != "" && $("#stats_end").val() != "") {
        stats_start_time = +new Date($("#stats_start").val()) / 1000;
        stats_end_time = +new Date($("#stats_end").val()) / 1000 + 86400;
    }
    $.ajax({
        url: api_host + "/" + dhabbr + "/dlog/statistics/summary?start_time=" + stats_start_time + "&end_time=" + stats_end_time,
        type: "GET",
        dataType: "json",
        success: function (data) {
            d = data.response;
            drivers = TSeparator(d.driver.tot);
            newdrivers = TSeparator(d.driver.new);
            jobs = TSeparator(d.job.all.sum.tot);
            newjobs = TSeparator(d.job.all.sum.new);
            distance = sigfig(parseInt(d.distance.all.sum.tot * distance_ratio)) + distance_unit_txt;
            newdistance = sigfig(parseInt(d.distance.all.sum.new * distance_ratio)) + distance_unit_txt;
            europrofit = "€" + sigfig(d.profit.all.tot.euro);
            neweuroprofit = "€" + sigfig(d.profit.all.new.euro);
            dollarprofit = "$" + sigfig(d.profit.all.tot.dollar);
            newdollarprofit = "$" + sigfig(d.profit.all.new.dollar);
            fuel = sigfig(parseInt(d.fuel.all.sum.tot * fuel_ratio)) + fuel_unit_txt;
            newfuel = sigfig(parseInt(d.fuel.all.sum.new* fuel_ratio)) + fuel_unit_txt;
            $("#overview-stats-driver-tot").html(drivers);
            $("#overview-stats-driver-new").html(newdrivers);
            $("#overview-stats-distance-tot").html(distance);
            $("#overview-stats-distance-new").html(newdistance);
            $("#overview-stats-delivery-tot").html(jobs);
            $("#overview-stats-delivery-new").html(newjobs);
            $("#overview-stats-profit-tot").html(europrofit + " + " + dollarprofit);
            $("#overview-stats-profit-new").html(neweuroprofit + " + " + newdollarprofit);
            $("#dprofit").html(neweuroprofit + " + " + newdollarprofit);
            $("#overview-stats-fuel-tot").html(fuel);
            $("#overview-stats-fuel-new").html(newfuel);

            $("#dalljob").html(newjobs);
            $("#dtotdistance").html(newdistance);
        }
    });
}

function LoadStats(basic = false, noplaceholder = false) {
    if (curtab != "#overview-tab" && curtab != "#delivery-tab") return;
    if(curtab == "#overview-tab"){
        $.ajax({
            url: api_host + "/" + dhabbr,
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            }
        });
    }
    LoadChart();

    stats_start_time = parseInt(+ new Date() / 1000 - 86400);
    stats_end_time = parseInt(+ new Date() / 1000);
    $.ajax({
        url: api_host + "/" + dhabbr + "/dlog/statistics/summary?start_time=" + stats_start_time + "&end_time=" + stats_end_time,
        type: "GET",
        dataType: "json",
        success: function (data) {
            d = data.response;
            drivers = TSeparator(d.driver.tot);
            newdrivers = TSeparator(d.driver.new);
            jobs = TSeparator(d.job.all.sum.tot);
            newjobs = TSeparator(d.job.all.sum.new);
            distance = sigfig(parseInt(d.distance.all.sum.tot * distance_ratio)) + distance_unit_txt;
            newdistance = sigfig(parseInt(d.distance.all.sum.new * distance_ratio)) + distance_unit_txt;
            europrofit = "€" + sigfig(d.profit.all.tot.euro);
            neweuroprofit = "€" + sigfig(d.profit.all.new.euro);
            dollarprofit = "$" + sigfig(d.profit.all.tot.dollar);
            newdollarprofit = "$" + sigfig(d.profit.all.new.dollar);
            fuel = sigfig(parseInt(d.fuel.all.sum.tot * fuel_ratio)) + fuel_unit_txt;
            newfuel = sigfig(parseInt(d.fuel.all.sum.new* fuel_ratio)) + fuel_unit_txt;
            $("#overview-stats-driver-tot").html(drivers);
            $("#overview-stats-driver-new").html(newdrivers);
            $("#overview-stats-distance-tot").html(distance);
            $("#overview-stats-distance-new").html(newdistance);
            $("#overview-stats-delivery-tot").html(jobs);
            $("#overview-stats-delivery-new").html(newjobs);
            $("#overview-stats-profit-tot").html(europrofit + " + " + dollarprofit);
            $("#overview-stats-profit-new").html(neweuroprofit + " + " + newdollarprofit);
            $("#dprofit").html(neweuroprofit + " + " + newdollarprofit);
            $("#overview-stats-fuel-tot").html(fuel);
            $("#overview-stats-fuel-new").html(newfuel);

            $("#dalljob").html(newjobs);
            $("#dtotdistance").html(newdistance);
        }
    });

    // get weekly data
    start_time = parseInt(+ new Date() / 1000 - 86400 * 7);
    end_time = parseInt(+ new Date() / 1000);
    $.ajax({
        url: api_host + "/" + dhabbr + "/dlog/statistics/summary?start_time=" + start_time + "&end_time=" + end_time,
        type: "GET",
        dataType: "json",
        success: function (data) {
            d = data.response;
            drivers = TSeparator(d.driver.tot);
            newdrivers = TSeparator(d.driver.new);
            jobs = TSeparator(d.job.all.sum.tot);
            newjobs = TSeparator(d.job.all.sum.new);
            distance = sigfig(parseInt(d.distance.all.sum.tot * distance_ratio)) + distance_unit_txt;
            newdistance = sigfig(parseInt(d.distance.all.sum.new * distance_ratio)) + distance_unit_txt;
            europrofit = "€" + sigfig(d.profit.all.tot.euro);
            neweuroprofit = "€" + sigfig(d.profit.all.new.euro);
            dollarprofit = "$" + sigfig(d.profit.all.tot.dollar);
            newdollarprofit = "$" + sigfig(d.profit.all.new.dollar);
            fuel = sigfig(parseInt(d.fuel.all.sum.tot * fuel_ratio)) + fuel_unit_txt;
            newfuel = sigfig(parseInt(d.fuel.all.sum.new* fuel_ratio)) + fuel_unit_txt;
            $("#wprofit").html(neweuroprofit + " + " + newdollarprofit);
            $("#walljob").html(newjobs);
            $("#wtotdistance").html(newdistance);
        }
    });

    if (String(localStorage.getItem("token")).length != 36 || !isNumber(localStorage.getItem("userid")) || localStorage.getItem("userid") == "-1") return; // guest / invalid
    if (!basic) {
        $.ajax({
            url: api_host + "/" + dhabbr + "/dlog/leaderboard",
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                if (data.error) return toastNotification("error", "Error", data.descriptor, 5000, false);
                users = data.response.list;
                $("#table_mini_leaderboard_data").empty();
                for (var i = 0; i < Math.min(users.length, 5); i++) {
                    user = users[i];
                    userid = user.user.userid;
                    name = user.user.name;
                    discordid = user.user.discordid;
                    avatar = user.user.avatar;
                    totalpnt = TSeparator(parseInt(user.points.total));
                    if (avatar != null) {
                        if (avatar.startsWith("a_"))
                            src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif";
                        else
                            src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png";
                    } else {
                        avatar = logob64;
                    }
                    $("#table_mini_leaderboard_data").append(`<tr>
              <td>
                <img src='${src}' width="40px" height="40px" style="display:inline;border-radius:100%" onerror="if($(this).attr('src')!=logob64) $(this).attr('src',logob64);"></td>
            <td><a style="cursor: pointer" onclick="LoadUserProfile(${userid})">${name}</a></td>
              <td>${totalpnt}</td>
            </tr>`);
                }
            }
        });
        $.ajax({
            url: api_host + "/" + dhabbr + "/member/list?page=1&order_by=join_timestamp&order=desc",
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                if (data.error) return toastNotification("error", "Error", data.descriptor, 5000, false);
                users = data.response.list;
                $("#table_new_driver_data").empty();
                for (var i = 0; i < Math.min(users.length, 5); i++) {
                    user = users[i];
                    userid = user.userid;
                    name = user.name;
                    discordid = user.discordid;
                    avatar = user.avatar;
                    dt = new Date(user.join_timestamp * 1000);
                    joindt = MONTH_ABBR[dt.getMonth()] + " " + OrdinalSuffix(dt.getDate());
                    if (avatar != null) {
                        if (avatar.startsWith("a_"))
                            src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif";
                        else
                            src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png";
                    } else {
                        avatar = logob64;
                    }
                    $("#table_new_driver_data").append(`<tr>
              <td>
                <img src='${src}' width="40px" height="40px" style="display:inline;border-radius:100%" onerror="if($(this).attr('src')!=logob64) $(this).attr('src',logob64);"></td>
                <td><a style="cursor: pointer" onclick="LoadUserProfile(${userid})">${name}</a></td>
              <td>${joindt}</td>
            </tr>`);
                }
            }
        });
        $.ajax({
            url: api_host + "/" + dhabbr + "/member/list?page=1&order_by=last_seen&order=desc",
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                if (data.error) return toastNotification("error", "Error", data.descriptor, 5000, false);
                users = data.response.list;
                $("#table_recent_visitors_data").empty();
                for (var i = 0; i < Math.min(users.length, 5); i++) {
                    user = users[i];
                    userid = user.userid;
                    name = user.name;
                    discordid = user.discordid;
                    avatar = user.avatar;
                    last_seen = timeAgo(new Date(user.activity.last_seen * 1000));
                    if (avatar != null) {
                        if (avatar.startsWith("a_"))
                            src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif";
                        else
                            src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png";
                    } else {
                        avatar = logob64;
                    }
                    $("#table_recent_visitors_data").append(`<tr>
              <td>
                <img src='${src}' width="40px" height="40px" style="display:inline;border-radius:100%" onerror="if($(this).attr('src')!=logob64) $(this).attr('src',logob64);"></td>
                <td><a style="cursor: pointer" onclick="LoadUserProfile(${userid})">${name}</a></td>
              <td>${last_seen}</td>
            </tr>`);
                }
            }
        });
    }
}
function UpdateBio() {
    LockBtn("#button-settings-bio-save", mltr("saving"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/bio",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "bio": simplemde["#settings-bio"].value()
        },
        success: function (data) {
            UnlockBtn("#button-settings-bio-save");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success!", mltr("about_me_saved"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-settings-bio-save");
            AjaxError(data);
        }
    });
}

function ResetApplicationToken(firstop = false) {
    LockBtn("#button-settings-reset-application-token", mltr("resetting"));

    if(mfaenabled){
        otp = $("#mfa-otp").val();

        if(otp.length != 6){
            mfafunc = ResetApplicationToken;
            setTimeout(function(){UnlockBtn("#button-settings-reset-application-token");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
            return;
        }

        $.ajax({
            url: api_host + "/" + dhabbr + "/token/application",
            type: "PATCH",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            data: {
                otp: otp,
            },
            success: function (data) {
                UnlockBtn("#button-settings-reset-application-token");
                ShowTab("#user-settings-tab", "from-mfa");
                mfafunc = null;
                if (data.error) return AjaxError(data);
                $("#settings-application-token").html(data.response.token);
                $("#settings-application-token-p").hide();
                $("#settings-application-token").show();
                $("#button-application-token-copy").attr("onclick", `CopyButton("#button-application-token-copy", "${data.response.token}")`);
                $("#button-application-token-copy").show();
                toastNotification("success", "Success", mltr("application_token_reset"), 5000, false);
            },
            error: function (data) {
                if(firstop && data.status == 400){
                    // failed due to auto try, then do mfa
                    mfafunc = ResetApplicationToken;
                    setTimeout(function(){UnlockBtn("#button-settings-reset-application-token");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
                    return;
                }
                UnlockBtn("#button-settings-reset-application-token");
                AjaxError(data);
                ShowTab("#user-settings-tab", "from-mfa");
                mfafunc = null;
            }
        });
    }
    else{
        $.ajax({
            url: api_host + "/" + dhabbr + "/token/application",
            type: "PATCH",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                UnlockBtn("#button-settings-reset-application-token");
                if (data.error) return AjaxError(data);
                $("#settings-application-token").html(data.response.token);
                $("#settings-application-token-p").hide();
                $("#settings-application-token").show();
                $("#button-application-token-copy").attr("onclick", `CopyButton("#button-application-token-copy", "${data.response.token}")`);
                toastNotification("success", "Success", mltr("application_token_reset"), 5000, false);
            },
            error: function (data) {
                UnlockBtn("#button-settings-reset-application-token");
                AjaxError(data);
            }
        });
    }
}

function DisableApplicationToken(firstop = false) {
    LockBtn("#button-settings-disable-application-token", mltr("disabling"));

    if(mfaenabled){
        otp = $("#mfa-otp").val();

        if(otp.length != 6){
            mfafunc = DisableApplicationToken;
            setTimeout(function(){UnlockBtn("#button-settings-disable-application-token");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
            return;
        }

        $.ajax({
            url: api_host + "/" + dhabbr + "/token/application",
            type: "DELETE",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            data: {
                otp: otp
            },
            success: function (data) {
                UnlockBtn("#button-settings-disable-application-token");
                ShowTab("#user-settings-tab", "from-mfa");
                mfafunc = null;
                if (data.error) return AjaxError(data);
                $("#settings-application-token").html(mltr("disabled"));
                toastNotification("success", "Success", mltr("application_token_disabled"), 5000, false);
            },
            error: function (data) {
                if(firstop && data.status == 400){
                    // failed due to auto try, then do mfa
                    mfafunc = DisableApplicationToken;
                    setTimeout(function(){UnlockBtn("#button-settings-disable-application-token");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
                    return;
                }
                UnlockBtn("#button-settings-disable-application-token");
                AjaxError(data);
                ShowTab("#user-settings-tab", "from-mfa");
                mfafunc = null;
            }
        });
    } else {
        $.ajax({
            url: api_host + "/" + dhabbr + "/token/application",
            type: "DELETE",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                UnlockBtn("#button-settings-disable-application-token");
                if (data.error) return AjaxError(data);
                $("#settings-application-token").html(mltr("disabled"));
                toastNotification("success", "Success", mltr("application_token_disabled"), 5000, false);
            },
            error: function (data) {
                UnlockBtn("#button-settings-disable-application-token");
                AjaxError(data);
            }
        });
    }
}

function UpdatePassword(firstop = false) {
    LockBtn("#button-settings-password-update", mltr("updating"));

    if(mfaenabled){
        otp = $("#mfa-otp").val();

        if(otp.length != 6){
            mfafunc = UpdatePassword;
            setTimeout(function(){UnlockBtn("#button-settings-password-update");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
            return;
        }
        
        $.ajax({
            url: api_host + "/" + dhabbr + "/user/password",
            type: "PATCH",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            data: {
                "password": $("#settings-password").val(),
                otp: otp
            },
            success: function (data) {
                UnlockBtn("#button-settings-password-update");
                ShowTab("#user-settings-tab", "from-mfa");
                mfafunc = null;
                if (data.error) return AjaxError(data);
                $("#settings-password").val("");
                toastNotification("success", "Success", mltr("password_updated"), 5000, false);
            },
            error: function (data) {
                if(firstop && data.status == 400){
                    // failed due to auto try, then do mfa
                    mfafunc = UpdatePassword;
                    setTimeout(function(){UnlockBtn("#button-settings-password-update");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
                    return;
                }
                UnlockBtn("#button-settings-password-update");
                AjaxError(data);
                ShowTab("#user-settings-tab", "from-mfa");
                mfafunc = null;
            }
        });
    } else {
        $.ajax({
            url: api_host + "/" + dhabbr + "/user/password",
            type: "PATCH",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            data: {
                "password": $("#settings-password").val()
            },
            success: function (data) {
                UnlockBtn("#button-settings-password-update");
                if (data.error) return AjaxError(data);
                $("#settings-password").val("");
                toastNotification("success", "Success", mltr("password_updated"), 5000, false);
            },
            error: function (data) {
                UnlockBtn("#button-settings-password-update");
                AjaxError(data);
            }
        });
    }
}

function DisablePassword(firstop = false) {
    LockBtn("#button-settings-password-disable", mltr("disabling"));

    if(mfaenabled){
        otp = $("#mfa-otp").val();

        if(otp.length != 6){
            mfafunc = DisablePassword;
            setTimeout(function(){UnlockBtn("#button-settings-password-disable");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
            return;
        }
        
        $.ajax({
            url: api_host + "/" + dhabbr + "/user/password",
            type: "DELETE",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            data: {
                otp: otp
            },
            success: function (data) {
                UnlockBtn("#button-settings-password-disable");
                ShowTab("#user-settings-tab", "from-mfa");
                mfafunc = null;
                if (data.error) return AjaxError(data);
                toastNotification("success", "Success", mltr("password_login_disabled"), 5000, false);
            },
            error: function (data) {
                if(firstop && data.status == 400){
                    // failed due to auto try, then do mfa
                    mfafunc = DisablePassword;
                    setTimeout(function(){UnlockBtn("#button-settings-password-disable");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
                    return;
                }
                UnlockBtn("#button-settings-password-disable");
                AjaxError(data);
                ShowTab("#user-settings-tab", "from-mfa");
                mfafunc = null;
            }
        });
    } else {
        $.ajax({
            url: api_host + "/" + dhabbr + "/user/password",
            type: "DELETE",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                UnlockBtn("#button-settings-password-disable");
                if (data.error) return AjaxError(data);
                toastNotification("success", "Success", mltr("password_login_disabled"), 5000, false);
            },
            error: function (data) {
                UnlockBtn("#button-settings-password-disable");
                AjaxError(data);
            }
        });
    }
}

function DisableMFAShow(){
    modalid = ShowModal(mltr('disable_mfa'), mltr('disable_mfa_note'), `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-disable-mfa" type="button" class="btn btn-danger" onclick="DisableMFA();">${mltr('disable')}</button>`);
    InitModal("disable_mfa", modalid);
}

function DisableMFA(){
    otp = $("#mfa-otp").val();
    
    if(otp.length != 6){
        mfafunc = DisableMFA;
        LockBtn("#button-staff-disable-mfa", mltr("disabling"));
        setTimeout(function(){UnlockBtn("#button-staff-disable-mfa");DestroyModal("disable_mfa");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
        return;
    }

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/mfa",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            otp: otp
        },
        success: function (data) {
            ShowTab("#user-settings-tab", "from-mfa");
            mfafunc = null;
            if (data.error) return AjaxError(data);
            $("#button-settings-mfa-disable").hide();
            $("#button-settings-mfa-enable").show();
            mfaenabled = false;
            toastNotification("success", "Success", mltr("mfa_disabled"), 5000, false);
        },
        error: function (data) {
            AjaxError(data);
            ShowTab("#user-settings-tab", "from-mfa");
            mfafunc = null;
        }
    });
}

mfasecret = "";
function EnableMFAShow(){
    mfasecret = RandomB32String(16);
    modalid = ShowModal(mltr('enable_mfa'), `<p>${mltr('enable_mfa_note')}</p><p>${mltr('secret')}: <b>${mfasecret}</b></p>
    <label for="mfa-enable-otp" class="form-label">${mltr('otp')}</label>
    <div class="input-group mb-3">
        <input type="text" class="form-control bg-dark text-white" id="mfa-enable-otp" placeholder="000 000">
    </div>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-enable-mfa" type="button" class="btn btn-primary" onclick="EnableMFA();">${mltr('enable')}</button>`);
    InitModal("enable_mfa", modalid);
}

function EnableMFA(){
    otp = $("#mfa-enable-otp").val();
    if(!isNumber(otp) || otp.length != 6)
        return toastNotification("error", "Error", mltr("invalid_otp"), 5000);
        
    LockBtn("#button-enable-mfa", mltr("enabling"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/mfa",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            secret: mfasecret,
            otp: otp
        },
        success: function (data) {
            UnlockBtn("#button-enable-mfa");
            if (data.error) AjaxError(data);
            $("#button-settings-mfa-disable").show();
            $("#button-settings-mfa-enable").hide();
            mfaenabled = true;
            DestroyModal("enable_mfa");
            toastNotification("success", "Success", mltr("mfa_enabled"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-enable-mfa");
            AjaxError(data);
        }
    });
}

function UserResignShow(){
    modalid = ShowModal(mltr('leave_company'), mltr('leave_company_note'), `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-user-resign" type="button" class="btn btn-primary" onclick="UserResign();">${mltr('resign')}</button>`);
    InitModal("user_resign", modalid);
}

function UserResign() {
    LockBtn("#button-user-resign", mltr("resigning"));

    otp = $("#mfa-otp").val();
    if(mfaenabled){
        if(otp.length != 6){
            mfafunc = UserResign;
            setTimeout(function(){UnlockBtn("#button-user-resign");DestroyModal("user_resign");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
            return;
        }
    }

    $.ajax({
        url: api_host + "/" + dhabbr + "/member/resign",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            otp: otp
        },
        success: function (data) {
            ShowTab("#user-settings-tab", "from-mfa");
            mfafunc = null;
            if (data.error) return AjaxError(data);
            modalid = ShowModal(mltr('you_have_left_the_company'), mltr('you_have_left_the_company_note'));
        },
        error: function (data) {
            AjaxError(data);
            ShowTab("#user-settings-tab", "from-mfa");
            mfafunc = null;
        }
    });
}

function LoadNotificationSettings(){
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/settings",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#notifications-drivershub").removeAttr("disabled");
            $("#notifications-discord").removeAttr("disabled");
            $("#notifications-login").removeAttr("disabled");
            $("#notifications-dlog").removeAttr("disabled");
            $("#notifications-member").removeAttr("disabled");
            $("#notifications-application").removeAttr("disabled");
            $("#notifications-challenge").removeAttr("disabled");
            $("#notifications-division").removeAttr("disabled");
            $("#notifications-event").removeAttr("disabled");

            $("#notifications-drivershub").prop("checked", data.response.drivershub);
            $("#notifications-discord").prop("checked", data.response.discord);
            $("#notifications-login").prop("checked", data.response.login);
            $("#notifications-dlog").prop("checked", data.response.dlog);
            $("#notifications-member").prop("checked", data.response.member);
            $("#notifications-application").prop("checked", data.response.application);
            $("#notifications-challenge").prop("checked", data.response.challenge);
            $("#notifications-division").prop("checked", data.response.division);
            $("#notifications-event").prop("checked", data.response.event);
        }
    })
}

function EnableNotification(item, name){
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/" + item + "/enable",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if(data.error) return AjaxError(data);
            toastNotification("success", "Success", name + ` ${mltr('notification_enabled')}!`, 5000);
        }, error: function (data){
            AjaxError(data);
        }
    })
}

function DisableNotification(item, name){
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/" + item + "/disable",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if(data.error) return AjaxError(data);
            toastNotification("success", "Success", name + ` ${mltr('notification_disabled')}!`, 5000);
        }, error: function (data){
            AjaxError(data);
        }
    })
}

user_session_placeholder_row = `
<tr>
    <td style="width:40%;"><span class="placeholder w-100"></span></td>
    <td style="width:25%;"><span class="placeholder w-100"></span></td>
    <td style="width:25%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
</tr>`

function LoadUserSessions(noplaceholder = false) {
    if(!noplaceholder){
        $("#table_session_data").empty();
        for(var i = 0 ; i < 10 ; i ++){
            $("#table_session_data").append(user_session_placeholder_row);
        }    
    }

    $.ajax({
        url: api_host + "/" + dhabbr + "/token/list?page_size=50",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#table_session_data").empty();
            sessions = data.response.list;
            for (var i = 0; i < sessions.length; i++) {
                if (sha256(localStorage.getItem("token")) != sessions[i].hash)
                    opbtn = `<button id="button-revoke-token-${sessions[i].hash}" type="button" class="btn btn-sm btn-danger" onclick="RevokeToken('${sessions[i].hash}')">${mltr('revoke')}</button>`;
                else opbtn = `(Current)`;

                browser_icon = ``;
                if (sessions[i].user_agent.indexOf("Chrome") != -1) browser_icon = `<i class="fa-brands fa-chrome"></i>`;
                else if (sessions[i].user_agent.indexOf("Firefox") != -1) browser_icon = `<i class="fa-brands fa-firefox"></i>`;
                else if (sessions[i].user_agent.indexOf("MSIE") != -1) browser_icon = `<i class="fa-brands fa-internet-explorer"></i>`;
                else if (sessions[i].user_agent.indexOf("Edge") != -1) browser_icon = `<i class="fa-brands fa-edge"></i>`;
                else if (sessions[i].user_agent.indexOf("Opera") != -1) browser_icon = `<i class="fa-brands fa-opera"></i>`;
                else if (sessions[i].user_agent.indexOf("Safari") != -1) browser_icon = `<i class="fa-brands fa-safari"></i>`;

                $("#table_session_data").append(`<tr>
                    <td>${browser_icon}</td>
                    <td>${sessions[i].ip}</td>
                    <td>${sessions[i].country}</td>
                    <td>${getDateTime(sessions[i].create_timestamp * 1000)}</td>
                    <td>${timeAgo(new Date(sessions[i].last_used_timestamp * 1000))}</td>
                    <td>${opbtn}</td>
                </tr>`);
            }
        }
    })
}

function RevokeToken(hsh) {
    if ($("#button-revoke-token-" + hsh).html() == mltr("revoke")) {
        $("#button-revoke-token-" + hsh).html(mltr("confirm"));
        return;
    }

    LockBtn("#button-revoke-token-" + hsh, mltr("revoking"))

    $.ajax({
        url: api_host + "/" + dhabbr + "/token/hash",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "hash": hsh
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            LoadUserSessions(noplaceholder = true);
            toastNotification("success", "Success", mltr("token_revoked"), 5000, false);
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

bannedUserList = {};

user_placeholder_row = `
<tr>
    <td style="width:40%;"><span class="placeholder w-100"></span></td>
    <td style="width:40%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
</tr>`;

function LoadUserList(noplaceholder = false) {
    InitPaginate("#table_pending_user_list", "LoadUserList();");
    page = parseInt($("#table_pending_user_list_page_input").val())
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    if(!noplaceholder){
        $("#table_pending_user_list_data").children().remove();
        for (i = 0; i < 15; i++) {
            $("#table_pending_user_list_data").append(user_placeholder_row);
        }
    }

    name = $("#input-user-search").val();
    LockBtn("#button-user-list-search", "...");

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/list?page=" + page + "&page_size=15&name=" + name,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-user-list-search");
            if (data.error) return AjaxError(data);

            userList = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < userList.length; i++) {
                user = userList[i];
                bantxt = mltr("ban");
                bantxt2 = "";
                color = "";
                if (user.ban.is_banned) color = "grey", bantxt = mltr("unban"), bantxt2 = "(" + mltr("banned") + ")", bannedUserList[user.discordid] = user.ban.reason;

                userop = "";
                if(userPerm.includes("hrm") || userPerm.includes("admin")){
                    userop = `<div class="dropdown">
                        <a class="dropdown-toggle clickable" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Manage
                        </a>
                        <ul class="dropdown-menu dropdown-menu-dark">
                            <li><a class="dropdown-item clickable" onclick="ShowUserDetail('${user.discordid}')">${mltr("show_details")}</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item clickable" onclick="AcceptAsMemberShow('${user.discordid}', '${convertQuotation1(user.name)}')">${mltr('accept_as_member')}</a></li>
                            <li><a class="dropdown-item clickable" onclick="UpdateUsername('${user.discordid}')">${mltr('refresh_username')}</a></li>
                            <li><a class="dropdown-item clickable" onclick="UpdateDiscordShow('${user.discordid}', '${convertQuotation1(user.name)}')">${mltr('update_discord_id')}</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item clickable" style="color:red" onclick="DisableUserMFAShow('${discordid}', '${convertQuotation1(name)}')">${mltr('disable_mfa')}</a></li>
                            <li><a class="dropdown-item clickable" style="color:red" onclick="DeleteConnectionsShow('${discordid}', '${convertQuotation1(name)}')">${mltr('delete_connections')}</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item clickable" style="color:red" onclick="${bantxt}Show('${user.discordid}', '${convertQuotation1(user.name)}')">${bantxt}</a></li>
                            <li><a class="dropdown-item clickable" style="color:red" onclick="DeleteUserShow('${user.discordid}', '${convertQuotation1(user.name)}')">${mltr('delete')}</a></li>
                        </ul>
                    </div>`;
                } else if(userPerm.includes("hr")){
                    userop = `<div class="dropdown">
                        <a class="dropdown-toggle clickable" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Manage
                        </a>
                        <ul class="dropdown-menu dropdown-menu-dark">
                            <li><a class="dropdown-item clickable" onclick="ShowUserDetail('${user.discordid}')">${mltr("show_details")}</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item clickable" onclick="AcceptAsMemberShow('${user.discordid}', '${convertQuotation1(user.name)}')">${mltr('accept_as_member')}</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item clickable" style="color:red">${bantxt}</a></li>
                        </ul>
                    </div>`;
                }

                data.push([`<span style='color:${color}'>${GetAvatar(user.userid, user.name, user.discordid, user.avatar)} ${bantxt2}</span>`, `<span style='color:${color}'>${user.discordid}</span>`, userop]);
            }

            PushTable("#table_pending_user_list", data, total_pages, "LoadUserList();");
        },
        error: function (data) {
            UnlockBtn("#button-user-list-search");
            AjaxError(data);
        }
    })
}

function ShowUserDetail(discordid) {
    function GenTableRow(key, val) {
        return `<tr><td><b>${key}</b></td><td>${val}</td></tr>\n`;
    }
    $.ajax({
        url: api_host + "/" + dhabbr + "/user?discordid=" + String(discordid),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            
            d = data.response.user;
            info = "";
            info += GenTableRow(mltr("name"), d.name);
            info += GenTableRow(mltr("email"), d.email);
            info += GenTableRow(mltr("discord"), discordid);
            info += GenTableRow(mltr("truckersmp"), `<a href='https://truckersmp.com/user/${d.truckersmpid}'>${d.truckersmpid}</a>`);
            info += GenTableRow(mltr("steam"), `<a href='https://steamcommunity.com/profiles/${d.steamid}'>${d.steamid}</a>`);
            if (Object.keys(bannedUserList).indexOf(discordid) != -1) {
                info += GenTableRow(mltr("ban_reason"), bannedUserList[discordid]);
            }
                
            modalid = ShowModal(d.name, `<table>${info}</table>`);
            InitModal("user_detail", modalid);
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

function AcceptAsMemberShow(discordid, name){
    modalid = ShowModal(mltr('accept_as_member'), `<p>${mltr('accept_as_member_note_1')}</p><p><i>${name} (>${mltr('discord_id')}: ${discordid})</i></p><br><p>${mltr('accept_as_member_note_2')}</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-accept-as-member" type="button" class="btn btn-primary" onclick="AcceptAsMember('${discordid}');">${mltr('accept')}</button>`);
    InitModal("accept_as_member", modalid);
}

function AcceptAsMember(discordid) {
    LockBtn("#button-accept-as-member", mltr("accepting"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/member",
        type: "PUT",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: discordid
        },
        success: function (data) {
            UnlockBtn("#button-accept-as-member");
            if (data.error) return AjaxError(data);
            LoadUserList(noplaceholder=true);
            toastNotification("success", "Success", mltr("user_accepted_as_member_user_id_") + data.response.userid, 5000, false);
            DestroyModal("accept_as_member");
        },
        error: function (data) {
            UnlockBtn("#button-accept-as-member");
            AjaxError(data);
        }
    })
}

function UpdateDiscordShow(discordid, name){
    modalid = ShowModal(mltr('update_discord_id'), `<p>${mltr('update_discord_id_note_1')}</p><p><i>${name} (${mltr('discord_id')}: ${discordid})</i></p><br><label for="new-discord-id" class="form-label">${mltr('new_discord_id')}</label>
    <div class="input-group mb-3">
        <input type="text" class="form-control bg-dark text-white" id="new-discord-id" placeholder="">
    </div><br><p>${mltr('update_discord_id_note_2')}</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-update-discord" type="button" class="btn btn-primary" onclick="UpdateDiscord('${discordid}');">${mltr('update')}</button>`);
    InitModal("update_discord", modalid);
}

function UpdateDiscord(old_discord_id) {
    LockBtn("#button-update-discord", mltr("updating"));

    new_discord_id = $("#new-discord-id").val();

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/discord",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            old_discord_id: old_discord_id,
            new_discord_id: new_discord_id
        },
        success: function (data) {
            UnlockBtn("#button-update-discord");
            if (data.error) return AjaxError(data);
            LoadUserList(noplaceholder=true);
            toastNotification("success", "Success", mltr("users_discord_id_has_been_updated"), 5000, false);
            DestroyModal("update_discord");
        },
        error: function (data) {
            UnlockBtn("#button-update-discord");
            AjaxError(data);
        }
    })
}

function DisableUserMFAShow(discordid, name){
    $.ajax({
        url: api_host + "/" + dhabbr + "/user?discordid="+discordid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data)
            mfa = data.response.user.mfa;
            if(!mfa){
                return toastNotification("error", "Error", mltr("user_hasnt_enabled_mfa"), 5000);
            }
            modalid = ShowModal(mltr('disable_mfa'), `<p>${mltr('disable_mfa_note_1')}</p><p><i>${name} (${mltr('discord_id')}: ${discordid})</i></p><br><p>${mltr('disable_mfa_note_2')}</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-staff-disable-mfa" type="button" class="btn btn-danger" onclick="StaffDisableMFA('${discordid}');">${mltr('disable')}</button>`);
            InitModal("disable_mfa", modalid);
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function StaffDisableMFA(discordid) {
    LockBtn("#button-staff-disable-mfa", mltr("disabling"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/mfa?discordid="+discordid,
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-staff-disable-mfa");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", mltr("users_mfa_disabled"), 5000, false);
            DestroyModal("disable_mfa");
        },
        error: function (data) {
            UnlockBtn("#button-staff-disable-mfa");
            AjaxError(data);
        }
    })
}

function DeleteConnectionsShow(discordid, name){
    modalid = ShowModal(mltr('delete_connections'), `<p>${mltr('delete_connections_note_1')}</p><p><i>${name} (${mltr('discord_id')}: ${discordid})</i></p><br><p>${mltr('delete_connections_note_2')}</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-delete-connections" type="button" class="btn btn-primary" onclick="DeleteConnections('${discordid}');">${mltr('delete')}</button>`);
    InitModal("account_connections", modalid);
}

function DeleteConnections(discordid) {
    LockBtn("#button-delete-connections", mltr("deleting"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/connections",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: discordid
        },
        success: function (data) {
            UnlockBtn("#button-delete-connections");
            if (data.error) return AjaxError(data);
            LoadUserList(noplaceholder=true);
            toastNotification("success", "Success", mltr("users_account_connections_unbound"), 5000, false);
            DestroyModal("account_connections");
        },
        error: function (data) {
            UnlockBtn("#button-delete-connections");
            AjaxError(data);
        }
    })
}

function BanShow(discordid, name){
    modalid = ShowModal(mltr('ban_user'), `<p>${mltr('ban_user_note_1')}</p><p><i>${name} (${mltr('discord_id')}: ${discordid})</i></p><br><p>${mltr('ban_user_note_2')}</p><br><label for="new-discord-id" class="form-label">${mltr('ban_until')}</label>
    <div class="input-group mb-3">
        <input type="date" class="form-control bg-dark text-white" id="ban-until">
    </div>
    <label for="ban-reason" class="form-label">${mltr('reason')}</label>
    <div class="input-group mb-3" style="height:calc(100% - 160px)">
        <textarea type="text" class="form-control bg-dark text-white" id="ban-reason" placeholder="" rows="3"></textarea>
    </div>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-ban-user" type="button" class="btn btn-danger" onclick="BanUser('${discordid}');">${mltr('ban')}</button>`);
    InitModal("ban_user", modalid);
}

function BanUser(discordid) {
    LockBtn("#button-ban-user", mltr("banning"));

    expire = -1;
    if ($("#ban-until").val() != "")
        expire = +new Date($("#ban-until").val()) / 1000;
    reason = $("#ban-reason").val();

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/ban",
        type: "PUT",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: discordid,
            expire: expire,
            reason: reason
        },
        success: function (data) {
            UnlockBtn("#button-ban-user");
            if (data.error) return AjaxError(data);
            LoadUserList(noplaceholder=true);
            toastNotification("success", "Success", mltr("user_banned"), 5000, false);
            DestroyModal("ban_user");
        },
        error: function (data) {
            UnlockBtn("#button-ban-user");
            AjaxError(data);
        }
    })
}

function UnbanShow(discordid, name){
    modalid = ShowModal(mltr('unban_user'), `<p>${mltr('unban_user_note')}</p><p><i>${name} (${mltr('discord_id')}: ${discordid})</i></p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-unban-user" type="button" class="btn btn-success" onclick="UnbanUser('${discordid}');">${mltr('unban')}</button>`);
    InitModal("unban_user", modalid);
}

function UnbanUser(discordid) {
    LockBtn("#button-unban-user", mltr("unbanning"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/ban",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: discordid
        },
        success: function (data) {
            UnlockBtn("#button-unban-user");
            if (data.error) return AjaxError(data);
            LoadUserList(noplaceholder=true);
            toastNotification("success", "Success", mltr("user_unbanned"), 5000, false);
            DestroyModal("unban_user");
        },
        error: function (data) {
            UnlockBtn("#button-unban-user");
            AjaxError(data);
        }
    })
}

function DeleteUserShow(discordid, name){
    modalid = ShowModal(mltr('delete_user'), `<p>${mltr('delete_user_note_1')}</p><p><i>${name} (${mltr('discord_id')}: ${discordid})</i></p><br><p>${mltr('delete_user_note_2')}</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-delete-user" type="button" class="btn btn-danger" onclick="DeleteUser('${discordid}');">${mltr('delete')}</button>`);
    InitModal("delete_user", modalid);
}

function DeleteUser(discordid) {
    LockBtn("#button-delete-user", mltr("deleting"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/user?discordid="+discordid,
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-delete-user");
            if (data.error) return AjaxError(data);
            LoadUserList(noplaceholder=true);
            toastNotification("success", "Success", mltr("user_deleted"), 5000, false);
            DestroyModal("delete_user");
        },
        error: function (data) {
            UnlockBtn("#button-delete-user");
            AjaxError(data);
        }
    })
}

function DeleteAccountShow(){
    modalid = ShowModal(mltr('delete_account'), mltr('delete_account_note'), `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-delete-account" type="button" class="btn btn-danger" onclick="DeleteAccount();">${mltr('delete')}</button>`);
    InitModal("delete_account", modalid);
}

function DeleteAccount(discordid) {
    LockBtn("#button-delete-account", mltr("deleting"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/user",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-delete-account");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", mltr("account_deleted_goodbye"), 5000, false);
            Logout();
            DestroyModal("delete_account");
        },
        error: function (data) {
            UnlockBtn("#button-delete-account");
            AjaxError(data);
        }
    })
}

function LoadNotification(){
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/list",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            d = data.response.list;
            $("#notification-dropdown").children().remove();
            for(i = 0 ; i < d.length ; i++){
                style="";
                if(d[i].read) style="color:grey"
                $("#notification-dropdown").append(`
                <div>
                    <p style="margin-bottom:0px;${style}">${marked.parse(d[i].content).replaceAll("\n","<br>").replaceAll("<p>","").replaceAll("</p>","").slice(0,-1)}</p>
                    <p class="text-muted" style="margin-bottom:5px">${timeAgo(new Date(d[i].timestamp*1000))}</p>
                </div>`);
            }
        }
    });

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/list?status=0",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            cnt = data.response.total_items;
            if(cnt > 0 && cnt <= 99){
                $("#notification-pop").show();
                $("#unread-notification").html(cnt);
            } else if (cnt >= 100){
                $("#notification-pop").show();
                $("#unread-notification").html("99+");
            }
        }
    });
}

notification_placerholder_row = `
<tr>
    <td style="width:calc(100% - 180px);"><span class="placeholder w-100"></span></td>
    <td style="width:180px;"><span class="placeholder w-100"></span></td>
</tr>`;

function LoadNotificationList(noplaceholder = false){
    InitPaginate("#table_notification_list", "LoadNotificationList();");
    page = parseInt($("#table_notification_list_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;
    if(!noplaceholder){
        $("#table_notification_list_data").empty();
        for(var i = 0 ; i < 10 ; i++){
            $("#table_notification_list_data").append(notification_placerholder_row);
        }
    }
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/list?page_size=30&page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            if (data.error) return AjaxError(data);
            
            notificationList = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < notificationList.length; i++) {
                notification = notificationList[i];

                data.push([`${marked.parse(notification.content).replaceAll("\n","<br>").replaceAll("<p>","").replaceAll("</p>","").slice(0,-1)}`, timeAgo(new Date(notification.timestamp * 1000))]);
            }

            PushTable("#table_notification_list", data, total_pages, "LoadNotificationList();");
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

function NotificationsMarkAllAsRead(){
    if($("#unread-notification").html()=="") return;
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/status?notificationids=all",
        type: "PUT",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "read": "true"
        },
        success: function (data) {
            $("#notification-pop").hide();
            $("#unread-notification").html("");
        }
    });
}
function toastNotification(type, title, text, time = 5) {
    new Noty({
        type: type,
        layout: 'topRight',
        text: text,
        timeout: time,
        theme: "mint"
    }).show();
}

steamids = {};
driverdata = {};
ets2data = {};
atsdata = {};
membersteam = {};
memberuserid = {};
curtab = "#overview-tab";
distance_unit = localStorage.getItem("distance_unit");
if (distance_unit == "imperial") {
    distance_unit_txt = "mi";
    distance_ratio = 0.621371;
} else {
    distance_unit = "metric";
    distance_ratio = 1;
    distance_unit_txt = "km";
}

function UpdateSteam() {
    $.ajax({
        url: api_host + "/" + dhabbr + "/member/list/all",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return;
            l = data.response.list;
            for (var i = 0; i < l.length; i++) {
                membersteam[l[i].steamid] = l[i].name;
                memberuserid[l[i].steamid] = l[i].userid;
            }
        }
    });
}
UpdateSteam();
setInterval(UpdateSteam, 600 * 1000);

$(document).ready(async function () {
    while (1) {
        if(isNumber(navio_company_id)) break;
        await sleep(100);
    }
    
    const socket = new WebSocket('wss://gateway.navio.app/');
    socket.addEventListener("open", () => {
        socket.send(
            JSON.stringify({
                op: 1,
                data: {
                    "subscribe_to_company": parseInt(navio_company_id),
                    //"subscribe_to_all_drivers": true
                },
            }),
        );
    });

    socket.addEventListener("message", ({
        data: message
    }) => {
        let {
            type,
            data
        } = JSON.parse(message)

        if (type === "AUTH_ACK") {
            setInterval(() => {
                socket.send(
                    JSON.stringify({
                        op: 2,
                    }),
                );
            }, data.heartbeat_interval * 1000);
        }

        if (type === "TELEMETRY_UPDATE") {
            steamids[data.driver] = +new Date();
            driverdata[data.driver] = data;
            if (data.game.id == "eut2") ets2data[data.driver] = data;
            else if (data.game.id == "ats") atsdata[data.driver] = data;
        }

        if (type === "NEW_EVENT") {
            if (data.type == 1) {
                drivername = membersteam[data.driver];
                if (drivername == "undefined" || drivername == undefined) drivername = mltr("unknown_driver");
                $("#delivery-tab").removeClass("loaded");
                toastNotification("success", mltr("job_delivery"), "<b>" + drivername + "</b><br><b>" + mltr("distance") + ":</b> " + TSeparator(parseInt(data.distance * distance_ratio)) + distance_unit_txt + "<br><b>" + mltr("revenue") + ":</b> €" + TSeparator(data.revenue), 10000, false);
            }
        }
    });
})

function CountOnlineDriver() {
    drivers = Object.keys(steamids);
    for (var i = 0; i < drivers.length; i++) {
        if (+new Date() - steamids[drivers[i]] > 120000) {
            if (driverdata[drivers[i]].game.id == "eut2") delete ets2data[drivers[i]];
            else if (driverdata[drivers[i]].game.id == "ats") delete atsdata[drivers[i]];
            delete steamids[drivers[i]];
            delete driverdata[drivers[i]];
        }
    }
    return Object.keys(steamids).length;
}

setInterval(function () {
    cnt = CountOnlineDriver()
    $("#overview-stats-live").html(cnt);
    if (cnt <= 1) $("#topbar-message").html(`<span class="rect-20"><i class="fa-solid fa-truck-fast"></i></span> ` + cnt + " Driver Trucking");
    else $("#topbar-message").html(`<span class="rect-20"><i class="fa-solid fa-truck-fast"></i></span> ` + cnt + " Drivers Trucking");
    dt = new Date();
    t = pad(dt.getHours(), 2) + ":" + pad(dt.getMinutes(), 2) + ":" + pad(dt.getSeconds(), 2);
    $("#overview-stats-live-datetime").html(t);

    $("#table_online_driver_data").empty();
    if (cnt == 0) {
        $("#table_online_driver_head").hide();
        $("#table_online_driver_data").append(`<tr><td style="color:#ccc"><i>No Data</i></td>`);
        return;
    }
    $("#table_online_driver_head").show();

    for (var i = 0; i < cnt; i++) {
        steamid = Object.keys(steamids)[i];
        drivername = membersteam[steamid];
        nuserid = memberuserid[steamid];
        if (drivername == "undefined" || drivername == undefined) drivername = "Unknown";
        d = driverdata[steamid];
        truck = d.truck.brand.name + " " + d.truck.name;
        cargo = "<i>Free roaming</i>";
        if (d.job != null)
            cargo = d.job.cargo.name;
        speed = parseInt(d.truck.speed * 3.6 * distance_ratio) + distance_unit_txt + "/h";
        distance = TSeparator(parseInt(d.truck.navigation.distance / 1000 * distance_ratio)) + "." + String(parseInt(d.truck.navigation.distance * distance_ratio) % 1000).substring(0, 1) + distance_unit_txt;
        $("#table_online_driver_data").append(`
            <tr>
              <td><a style='cursor:pointer' onclick='LoadUserProfile(${nuserid})'>${drivername}</a></td>
              <td>${truck}</td>
              <td>${cargo}</td>
              <td>${speed}</td>
              <td>${distance}</td>
            </tr>`);
    }
}, 1000);

autocenterint = {};

function PlayerPoint(steamid, mapid) {
    if (steamid == 0 || steamid == "0") return;
    drivername = membersteam[steamid];
    nuserid = memberuserid[steamid];
    if (drivername == "undefined" || drivername == undefined) drivername = "Unknown";
    d = driverdata[steamid];
    truck = d.truck.brand.name + " " + d.truck.name;
    cargo = "<i>Free roaming</i>";
    if (d.job != null)
        cargo = d.job.cargo.name;
    speed = parseInt(d.truck.speed * 3.6 * distance_ratio) + distance_unit_txt + "/h";
    distance = TSeparator(parseInt(d.truck.navigation.distance / 1000 * distance_ratio)) + "." + String(parseInt(d.truck.navigation.distance * distance_ratio) % 1000).substring(0, 1) + distance_unit_txt;
    toastNotification("info", drivername, `<b>${mltr("truck")}: </b>${truck}<br><b>${mltr("cargo")}: </b>${cargo}<br><b>${mltr("speed")}: </b>${speed}<br><a style='cursor:pointer' onclick='LoadUserProfile(${nuserid})'>${mltr("show_profile")}</a>`, 5000, false);
    clearInterval(autocenterint[mapid]);
    autocenterint[mapid] = setInterval(function () {
        d = driverdata[steamid];
        if (d == undefined) return;
        window.mapcenter[mapid] = [d.truck.position.x, -d.truck.position.z];
        $("#map > div > canvas").click(function () {
            clearInterval(autocenterint["map"]);
            autocenterint["map"] = -1;
        });
        $("#amap > div > canvas").children().click(function () {
            clearInterval(autocenterint["amap"]);
            autocenterint["amap"] = -1;
        });
        $("#pmap > div > canvas").children().click(function () {
            clearInterval(autocenterint["pmap"]);
            autocenterint["pmap"] = -1;
        });
    }, 100)
}

trucksvg = `<svg id="truck-svg" xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-truck-delivery" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" color="red" fill="none" stroke-linecap="round" stroke-linejoin="round"> <path stroke="none" d="M0 0h24v24H0z" fill="none"/> <circle cx="7" cy="17" r="2" /> <circle cx="17" cy="17" r="2" /> <path d="M5 17h-2v-4m-1 -8h11v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5" /> <line x1="3" y1="9" x2="7" y2="9" /> </svg> `;

function RenderPoint(mapid, steamid, x, y, scale, nodetail = false, truckicon = false) {
    // console.log("Render point " + x + ", " + y);
    maph = $("#" + mapid).height();
    //x = -maph + x;
    drivername = membersteam[steamid];
    t = $("#" + mapid).position().top;
    l = $("#" + mapid).position().left;
    if (truckicon) {
        $("#" + mapid).append(`<a class="${mapid}-player" style='cursor:pointer;position:absolute;top:${t+x-12}px;left:${l+y-12}px' onclick="PlayerPoint('${steamid}', '${mapid}')";>${trucksvg}</a>`);
        return;
    }
    if (scale <= 10) {
        if (!nodetail) $("#" + mapid).append(`<a class="${mapid}-player" style='cursor:pointer;position:absolute;top:${t+x-30}px;left:${l+y-7.5}px;text-align:center;color:skyblue' onclick="PlayerPoint('${steamid}', '${mapid}')";>${drivername}</a>`);
        $("#" + mapid).append(`<a class="${mapid}-player dot" style='cursor:pointer;position:absolute;top:${t+x-7.5}px;left:${l+y-7.5}px' onclick="PlayerPoint('${steamid}', '${mapid}')";></a>`);
    } else if (scale <= 25) {
        $("#" + mapid).append(`<a class="${mapid}-player dot-small" style='cursor:pointer;position:absolute;top:${t+x-5}px;left:${l+y-5}px' onclick="PlayerPoint('${steamid}', '${mapid}')"></a>`);
        $("#" + mapid).append(`<a class="${mapid}-player dot-area" style='cursor:pointer;position:absolute;top:${t+x-25}px;left:${l+y-25}px' onclick="PlayerPoint('${steamid}', '${mapid}')"></a>`);
    } else {
        $("#" + mapid).append(`<a class="${mapid}-player dot-area" style='cursor:pointer;position:absolute;top:${t+x-25}px;left:${l+y-25}px' onclick="PlayerPoint('${steamid}', '${mapid}')"></a>`);
    }
}

window.n = {};
setInterval(function () {
    if (curtab != "#map-tab") {
        $(".map-player").remove();
        return;
    }
    if (window.n == undefined || window.n.previousExtent_ == undefined) return;
    window.mapRange = {};
    mapRange["top"] = window.n.previousExtent_[3];
    mapRange["left"] = window.n.previousExtent_[0];
    mapRange["bottom"] = window.n.previousExtent_[1];
    mapRange["right"] = window.n.previousExtent_[2];
    $(".map-player").remove();
    players = Object.keys(ets2data);
    for (var i = 0; i < players.length; i++) {
        if (Object.keys(ets2data).indexOf(players[i]) == -1) {
            delete ets2data[players[i]];
            continue;
        }
        if (JSON.stringify(ets2data[players[i]]).toLowerCase().indexOf("promod") != -1) continue; // bypass promod on base map
        pos = ets2data[players[i]].truck.position;
        x = pos.x;
        z = -pos.z;
        mapxl = mapRange["left"];
        mapxr = mapRange["right"];
        mapyt = mapRange["top"];
        mapyb = mapRange["bottom"];
        mapw = $("#map").width();
        maph = $("#map").height();
        scale = (mapxr - mapxl) / $("#map").width();
        if (x > mapxl && x < mapxr && z > mapyb && z < mapyt) {
            rx = (x - mapxl) / (mapxr - mapxl) * mapw;
            rz = (z - mapyt) / (mapyb - mapyt) * maph;
            RenderPoint("map", players[i], rz, rx, scale);
        }
    }
}, 500);

window.an = {};
setInterval(function () {
    if (curtab != "#map-tab") {
        $(".amap-player").remove();
        return;
    }
    if (window.an == undefined || window.an.previousExtent_ == undefined) return;
    window.amapRange = {};
    amapRange["top"] = window.an.previousExtent_[3];
    amapRange["left"] = window.an.previousExtent_[0];
    amapRange["bottom"] = window.an.previousExtent_[1];
    amapRange["right"] = window.an.previousExtent_[2];
    $(".amap-player").remove();
    aplayers = Object.keys(atsdata);
    for (var i = 0; i < aplayers.length; i++) {
        if (Object.keys(atsdata).indexOf(players[i]) == -1) {
            delete atsdata[players[i]];
            continue;
        }
        if (JSON.stringify(atsdata[players[i]]).toLowerCase().indexOf("promod") != -1) continue; // bypass promod on base map
        if (JSON.stringify(atsdata[players[i]]).toLowerCase().indexOf("coast to coast") != -1) continue; // bypass coast to coast on base map
        apos = atsdata[aplayers[i]].truck.position;
        ax = apos.x;
        az = -apos.z;
        amapxl = amapRange["left"];
        amapxr = amapRange["right"];
        amapyt = amapRange["top"];
        amapyb = amapRange["bottom"];
        amapw = $("#amap").width();
        amaph = $("#amap").height();
        ascale = (amapxr - amapxl) / $("#amap").width();
        if (ax > amapxl && ax < amapxr && az > amapyb && az < amapyt) {
            arx = (ax - amapxl) / (amapxr - amapxl) * amapw;
            arz = (az - amapyt) / (amapyb - amapyt) * amaph;
            RenderPoint("amap", aplayers[i], arz, arx, ascale);
        }
    }
}, 500);

window.pn = {};
setInterval(function () {
    if (curtab != "#map-tab") {
        $(".pmap-player").remove();
        return;
    }
    if (window.pn == undefined || window.pn.previousExtent_ == undefined) return;
    window.pmapRange = {};
    pmapRange["top"] = window.pn.previousExtent_[3];
    pmapRange["left"] = window.pn.previousExtent_[0];
    pmapRange["bottom"] = window.pn.previousExtent_[1];
    pmapRange["right"] = window.pn.previousExtent_[2];
    $(".pmap-player").remove();
    players = Object.keys(ets2data);
    for (var i = 0; i < players.length; i++) {
        if (Object.keys(ets2data).indexOf(players[i]) == -1) {
            delete ets2data[players[i]];
            continue;
        }
        if (JSON.stringify(ets2data[players[i]]).toLowerCase().indexOf("promod") == -1) continue;
        pos = ets2data[players[i]].truck.position;
        x = pos.x;
        z = -pos.z;
        mapxl = pmapRange["left"];
        mapxr = pmapRange["right"];
        mapyt = pmapRange["top"];
        mapyb = pmapRange["bottom"];
        mapw = $("#pmap").width();
        maph = $("#pmap").height();
        scale = (mapxr - mapxl) / $("#pmap").width();
        if (x > mapxl && x < mapxr && z > mapyb && z < mapyt) {
            rx = (x - mapxl) / (mapxr - mapxl) * mapw;
            rz = (z - mapyt) / (mapyb - mapyt) * maph;
            RenderPoint("pmap", players[i], rz, rx, scale);
        }
    }
}, 500);
ANNOUNCEMENT_ICON = [`<span class="rect-20"><i class="fa-solid fa-circle-info"></i></span>`, `<span class="rect-20"><i class="fa-solid fa-circle-info"></i></span>`, `<span class="rect-20"><i class="fa-solid fa-triangle-exclamation" style="color:yellow"></i></span>`, `<span class="rect-20"><i class="fa-solid fa-circle-xmark"style="color:red"></i></span>`, `<span class="rect-20"><i class="fa-solid fa-circle-check"style="color:green"></i></span>`];

announcement_placeholder_row = `<div class="row">
<div class="announcement shadow p-3 m-3 bg-dark rounded col">
    <h5><strong><span class="placeholder col-2"></span> <span class="placeholder col-7"></span></strong></h5>
    <h6 style="font-size:15px"><span class="placeholder col-3"></span> <span class="placeholder col-4"></span></h6>
    <p><span class="placeholder col-3"></span>&nbsp;&nbsp;<span class="placeholder col-6"></span></p>
    <p><span class="placeholder col-5"></span>&nbsp;&nbsp;<span class="placeholder col-4"></span></p>
</div>
<div class="announcement shadow p-3 m-3 bg-dark rounded col">
    <h5><strong><span class="placeholder col-2"></span> <span class="placeholder col-7"></span></strong></h5>
    <h6 style="font-size:15px"><span class="placeholder col-3"></span> <span class="placeholder col-4"></span></h6>
    <p><span class="placeholder col-3"></span>&nbsp;&nbsp;<span class="placeholder col-6"></span></p>
    <p><span class="placeholder col-5"></span>&nbsp;&nbsp;<span class="placeholder col-4"></span></p>
</div>
</div>`;

function LoadAnnouncement(noplaceholder = false){
    InitPaginate("#announcements", "LoadAnnouncement()");
    $("#announcement-tab .page-item").addClass("disabled");

    if(!noplaceholder){
        $("#announcements").children().remove();
        for(i = 0 ; i < 5 ; i++){
            $("#announcements").append(announcement_placeholder_row);
        }
    }

    page = parseInt($("#announcements_page_input").val());

    if(userPerm.includes("announcement") || userPerm.includes("admin")){
        $("#announcement-new").show();
    }
    $.ajax({
        url: api_host + "/" + dhabbr + "/announcement/list?page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: async function (data) {
            while(1){
                if(userPermLoaded) break;
                await sleep(100);
            }
            if(userPerm.includes("announcement") || userPerm.includes("admin")){
                $("#announcement-new").show();
            }
            announcements = data.response.list;
            content = "";
            for (i = 0; i < announcements.length; i++) {
                if(i % 2 == 0){
                    if(i != 0) content += `</div>`;
                    content += `<div class="row">`;
                }
                announcement = announcements[i];
                announcement_datetime = getDateTime(announcement.timestamp * 1000);
                author = announcement.author;
                announcement_control = "";
                announcement_control_title_style = "";
                announcement_control_top = "";
                announcement_control_bottom = "";
                if(userPerm.includes("announcement") || userPerm.includes("admin")){
                    announcement_control = `<div style="float:right"><a style="cursor:pointer" onclick="EditAnnouncementToggle(${announcement.announcementid})"><span class="rect-20"><i class="fa-solid fa-pen-to-square"></i></span></a><a style="cursor:pointer" onclick="DeleteAnnouncementShow(${announcement.announcementid})"><span class="rect-20"><i class="fa-solid fa-trash" style="color:red"></i></span></a></div>`;
                    announcement_control_title_style = `width:calc(100% - 70px)`;
                    announcement_control_top = `<input type="text" class="form-control bg-dark text-white" id="announcement-edit-${announcement.announcementid}-title" placeholder="A short and nice title" value="${announcement.title}" style="display:none;width:100%;">`;
                    public_checked = "";
                    private_checked = "";
                    if(announcement.is_private == true) private_checked = "checked";
                    else public_checked = "checked";
                    type_checked = [];
                    for(var j = 0 ; j < parseInt(announcement.announcement_type) ; j++){
                        type_checked.push("");
                    }
                    type_checked.push("selected");
                    for(var j = 0 ; j < 4 ; j++){
                        type_checked.push("");
                    }
                    announcement_control_bottom = `<div id="announcement-edit-${announcement.announcementid}-bottom-div" style="display:none;"><div class="input-group mb-3" style="height:calc(100% + 50px)">
                        <textarea type="text" class="form-control bg-dark text-white" id="announcement-edit-${announcement.announcementid}-content" placeholder="Content of the announcement, MarkDown supported" style="height:100%">${announcement.content}</textarea></div>
                    <div class="pb-2">
                        <div class="form-check" style="display:inline-block;width:80px;">
                            <input class="form-check-input" type="radio" name="announcement-edit-${announcement.announcementid}-visibility" id="announcement-edit-${announcement.announcementid}-visibility-public" ${public_checked}>
                                <label class="form-check-label" for="announcement-edit-${announcement.announcementid}-visibility-public">
                                    ${mltr("public")}
                                </label>
                            </div>
                        <div class="form-check" style="display:inline-block;width:80px;">
                            <input class="form-check-input" type="radio" name="announcement-edit-${announcement.announcementid}-visibility" id="announcement-edit-${announcement.announcementid}-visibility-private" ${private_checked}>
                            <label class="form-check-label" for="announcement-edit-${announcement.announcementid}-visibility-private">
                                ${mltr("private")}
                            </label>
                        </div>
                        <select style="display:inline-block;width:130px" class="form-select bg-dark text-white" aria-label="Default select example" id="announcement-edit-${announcement.announcementid}-type">
                            <option value="0" ${type_checked[0]}>${mltr("information")}</option>
                            <option value="1" ${type_checked[1]}>${mltr("event")}</option>
                            <option value="2" ${type_checked[2]}>${mltr("warning")}</option>
                            <option value="3" ${type_checked[3]}>${mltr("critical")}</option>
                            <option value="4" ${type_checked[4]}>${mltr("resolved")}</option>
                        </select>
                    </div>
                    <label for="announcement-edit-${announcement.announcementid}-discord" class="form-label">Discord Integration</label>
                    <div class="input-group mb-2">
                        <span class="input-group-text" id="announcement-edit-${announcement.announcementid}-discord-channel-label">${mltr("channel_id")}</span>
                        <input type="text" class="form-control bg-dark text-white" id="announcement-edit-${announcement.announcementid}-discord-channel" placeholder="" style="width: 150px;display:inline-block;margin-right:10px;">
                    </div>
                    <div class="input-group mb-2">
                        <span class="input-group-text" id="announcement-edit-${announcement.announcementid}-discord-channel-label">${mltr("message")}</span>
                        <input type="text" class="form-control bg-dark text-white" id="announcement-edit-${announcement.announcementid}-discord-message" placeholder="" style="width:250px;display:inline-block;">
                    </div>
                    <button id="button-announcement-edit-${announcement.announcementid}-save" type="button" class="btn btn-primary" style="float:right" onclick="EditAnnouncement(${announcement.announcementid});">${mltr("save")}</button></div>`;
                }
                content += `<div class="announcement shadow p-3 m-3 bg-dark rounded col" id="announcement-${announcement.announcementid}">
                    <h5 style="display:inline-block;${announcement_control_title_style}"><strong><span id="announcement-display-${announcement.announcementid}-title"> ${ANNOUNCEMENT_ICON[announcement.announcement_type]} ${announcement.title}</span>${announcement_control_top}</strong></h5>
                    ${announcement_control}
                    <h6 style="font-size:15px"><strong>${GetAvatar(author.userid, author.name, author.discordid, author.avatar)} | ${announcement_datetime}</strong></h6>
                    <div id="announcement-display-${announcement.announcementid}-content">${marked.parse(announcement.content.replaceAll("\n", "<br>"))}</div>
                    ${announcement_control_bottom}
                </div>`;
            }
            content += `</div>`;
            $("#announcements").children().remove();
            $("#announcements").append(content);
            UpdatePaginate("#announcements", data.response.total_pages, "LoadAnnouncement();");
        }
    });
}

function EditAnnouncementToggle(announcementid){
    $(`#announcement-edit-${announcementid}-bottom-div`).css("height", ($(`#announcement-display-${announcementid}-content`).height()) + "px");
    $(`#announcement-edit-${announcementid}-bottom-div`).toggle();
    $(`#announcement-edit-${announcementid}-title`).toggle();
    $(`#announcement-display-${announcementid}-content`).toggle();
    $(`#announcement-display-${announcementid}-title`).toggle();
}

function PostAnnouncement(){
    title = $("#announcement-new-title").val();
    content = simplemde["#announcement-new-content"].value();
    anntype = $("#announcement-new-type").find(":selected").val();
    if(!isNumber(anntype)){
        return toastNotification("warning", "Warning", mltr("please_select_an_announcement_type"), 3000);
    }
    is_private = $("#announcement-visibility-private").is(":checked");
    discord_channelid = $("#announcement-new-discord-channel").val();
    discord_message = $("#announcement-new-discord-message").val();
    if(!isNumber(discord_channelid)){
        discord_channelid = 0;
        discord_message = "";
    }
    LockBtn("#button-announcement-new-post", mltr("posting"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/announcement",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "title": title,
            "content": content,
            "announcement_type": anntype,
            "is_private": is_private,
            "channelid": discord_channelid,
            "discord_message_content": discord_message
        },
        success: function (data) {
            UnlockBtn("#button-announcement-new-post");
            if (data.error) AjaxError(data);
            toastNotification("success", "Success", mltr("announcement_posted"), 5000, false);
            LoadAnnouncement(noplaceholder = false);
        },
        error: function (data) {
            UnlockBtn("#button-announcement-new-post");
            AjaxError(data);
        }
    });
}

function EditAnnouncement(announcementid){
    title = $("#announcement-edit-"+announcementid+"-title").val();
    content = $("#announcement-edit-"+announcementid+"-content").val();
    anntype = $("#announcement-edit-"+announcementid+"-type").find(":selected").val();
    is_private = $("#announcement-edit-"+announcementid+"-visibility-private").is(":checked");
    discord_channelid = $("#announcement-edit-"+announcementid+"-discord-channel").val();
    discord_message = $("#announcement-edit-"+announcementid+"-discord-message").val();
    if(!isNumber(discord_channelid)){
        discord_channelid = 0;
        discord_message = "";
    }
    LockBtn("#button-announcement-edit-"+announcementid+"-save", mltr("saving"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/announcement?announcementid="+announcementid,
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "title": title,
            "content": content,
            "announcement_type": anntype,
            "is_private": is_private,
            "channelid": discord_channelid,
            "discord_message_content": discord_message
        },
        success: function (data) {
            UnlockBtn("#button-announcement-edit-"+announcementid+"-save");
            if (data.error) AjaxError(data);
            LoadAnnouncement(noplaceholder = false);
            toastNotification("success", "Success", mltr("edit_saved"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-announcement-edit-"+announcementid+"-save");
            AjaxError(data);
        }
    });
}

function DeleteAnnouncementShow(announcementid){
    if(shiftdown) return DeleteAnnouncement(announcementid);
    content = $("#announcement-display-"+announcementid+"-title").html();
    modalid = ShowModal(mltr("delete_announcement"), `<p>${mltr("delete_announcement_note")}</p><p><i>${content}</i></p><br><p style="color:#aaa"><span style="color:lightgreen">${mltr("delete_protip")}`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("cancel")}</button><button id="button-announcement-delete-${announcementid}" type="button" class="btn btn-danger" onclick="DeleteAnnouncement(${announcementid});">${mltr("delete")}</button>`);
    InitModal("delete_announcement", modalid);
}

function DeleteAnnouncement(announcementid){
    LockBtn("#button-announcement-delete-"+announcementid, mltr("deleting"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/announcement?announcementid=" + announcementid,
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            UnlockBtn("#button-announcement-delete-"+announcementid);
            if (data.error) AjaxError(data);
            LoadAnnouncement(noplaceholder = false);
            toastNotification("success", "Success", mltr("announcement_deleted"), 5000, false);
            if(Object.keys(modals).includes("delete_announcement")) DestroyModal("delete_announcement");
        },
        error: function (data) {
            UnlockBtn("#button-announcement-delete-"+announcementid);
            AjaxError(data);
        }
    });
}
applicationQuestions = {}
function PreserveApplicationQuestion(){
    for(var apptype = 1; apptype <= 100; apptype++){
        for(var i = 1 ; i <= 100 ; i++){
            if($("#application" + apptype + "Question" + i).length != 0){
                question = $("#application" + apptype + "Question" + i).html().replaceAll("\n"," ").replaceAll("  "," ");
                applicationQuestions["#application" + apptype + "Question" + i] = question;
            } else {
                continue;
            }
        }
    }
}

my_application_placeholder_row = `
<tr>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:15%;"><span class="placeholder w-100"></span></td>
    <td style="width:15%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
</tr>`;

function LoadUserApplicationList(noplaceholder = false) {
    InitPaginate("#table_my_application", "LoadUserApplicationList();");

    if(!noplaceholder){
        $("#table_my_application_data").children().remove();
        for(var i = 0 ; i < 15 ; i ++){
            $("#table_my_application_data").append(my_application_placeholder_row);
        }
    }

    page = parseInt($("#table_my_application_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    $.ajax({
        url: api_host + "/" + dhabbr + "/application/list?page=" + page + "&page_size=15&application_type=0",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            STATUS = [mltr("pending"), mltr("accepted"), mltr("declined")];

            applicationList = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < applicationList.length; i++) {
                application = applicationList[i];
                apptype = applicationTypes[application.application_type];
                if(apptype == undefined) apptype = mltr("unknown");
                submit_time = getDateTime(application.submit_timestamp * 1000);
                update_time = getDateTime(application.update_timestamp * 1000);
                if (application.update_timestamp == 0)  closedat = "/";
                status = STATUS[application.status];
                staff = application.last_update_staff;

                color = "lightblue";
                if (application.status == 1) color = "lightgreen";
                if (application.status == 2) color = "red";

                data.push([`${application.applicationid}`, `${apptype}`, `<span style="color:${color}">${status}</span>`, `${submit_time}`, `${submit_time}`, GetAvatar(staff.userid, staff.name, staff.discordid, staff.avatar),`<a id="button-my-application-${application.applicationid}" class="clickable" onclick="GetApplicationDetail(${application.applicationid})"><i class="fa-solid fa-folder-open"></i></a>`]);
            }

            PushTable("#table_my_application", data, total_pages, "LoadUserApplicationList();");
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

all_application_placeholder_row = `
<tr>
    <td style="width:5%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:15%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
</tr>`;

async function LoadAllApplicationList(noplaceholder = false) {
    InitPaginate("#table_all_application", "LoadAllApplicationList();");

    if(!noplaceholder){
        $("#table_all_application_data").children().remove();
        for(var i = 0 ; i < 15 ; i ++){
            $("#table_all_application_data").append(all_application_placeholder_row);
        }
    }

    page = parseInt($('#table_all_application_page_input').val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    $.ajax({
        url: api_host + "/" + dhabbr + "/application/list?page=" + page + "&page_size=15&application_type=0&all_user=1",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            STATUS = [mltr("pending"), mltr("accepted"), mltr("declined")];

            applicationList = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < applicationList.length; i++) {
                application = applicationList[i];
                apptype = applicationTypes[application.application_type];
                if(apptype == undefined) apptype = mltr("unknown");
                submit_time = getDateTime(application.submit_timestamp * 1000);
                update_time = getDateTime(application.update_timestamp * 1000);
                if (application.update_timestamp == 0)  closedat = "/";
                status = STATUS[application.status];
                creator = application.creator;
                staff = application.last_update_staff;

                color = "lightblue";
                if (application.status == 1) color = "lightgreen";
                if (application.status == 2) color = "red";

                data.push([`${application.applicationid}`, GetAvatar(creator.userid, creator.name, creator.discordid, creator.avatar), `${apptype}`, `<span style="color:${color}">${status}</span>`, `${submit_time}`, `${submit_time}`, GetAvatar(staff.userid, staff.name, staff.discordid, staff.avatar),`<a id="button-all-application-${application.applicationid}" class="clickable" onclick="GetApplicationDetail(${application.applicationid}, true)"><i class="fa-solid fa-folder-open"></i></a>`]);
            }

            PushTable("#table_all_application", data, total_pages, "LoadAllApplicationList();");
        },
        error: function (data) {
            AjaxError(data);
        }
    });

    while(1){
        if(userPermLoaded) break;
        await sleep(100);
    }
    if(userPerm.includes("hrm") || userPerm.includes("admin")){
        $("#all-application-right-wrapper").show();
    }
}

function GetApplicationDetail(applicationid, staffmode = false) {
    LockBtn("#button-my-application-" + applicationid, mltr("loading"));
    LockBtn("#button-all-application-" + applicationid, mltr("loading"));
    
    function GenTableRow(key, val) {
        return `<tr><td><b>${key}</b></td><td>${val}</td></tr>\n`;
    }

    $.ajax({
        url: api_host + "/" + dhabbr + "/application?applicationid=" + applicationid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error){
                UnlockBtn("#button-my-application-" + applicationid);
                UnlockBtn("#button-all-application-" + applicationid);
                return AjaxError(data);
            }

            d = data.response.application.detail;
            discordid = data.response.application.creator.discordid;
            keys = Object.keys(d);
            if (keys.length == 0)
                return toastNotification("error", "Error", mltr("application_has_no_data"), 5000, false);
                
            apptype = applicationTypes[data.response.application_type];
            ret = "";
            for (i = 0; i < keys.length; i++){
                ret += `<p class="mb-1"><b>${keys[i]}</b></p><p>${d[keys[i]]}</p>`;
            }

            $.ajax({
                url: api_host + "/" + dhabbr + "/user?discordid=" + String(discordid),
                type: "GET",
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                success: function (data) {
                    info = "";
                    if (!data.error) {
                        d = data.response.user;
                        info += GenTableRow(mltr("name"), d.name);
                        info += GenTableRow(mltr("email"), d.email);
                        info += GenTableRow(mltr("discord"), discordid);
                        info += GenTableRow(mltr("truckersmp"), `<a href='https://truckersmp.com/user/${d.truckersmpid}'>${d.truckersmpid}</a>`);
                        info += GenTableRow(mltr("steam"), `<a href='https://steamcommunity.com/profiles/${d.steamid}'>${d.steamid}</a>`);
                    }
                    bottom = "";
                    if (!staffmode) {
                        bottom = `
                            <label for="application-new-message" class="form-label">${mltr("message")}</label>
                            <div class="input-group mb-3" style="height:calc(100% - 160px)">
                                <textarea type="text" class="form-control bg-dark text-white" id="application-new-message" placeholder="${mltr("message_placeholder")}" style="height:160px"></textarea>
                            </div>`;
                        modalid = ShowModal(mltr("application") + " #" + applicationid, `<div><table>${info}</table></div><br><div>${ret}</div><hr>${bottom}`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("close")}</button><button id="button-application-new-message" type="button" class="btn btn-primary" onclick="AddMessageToApplication(${applicationid});">${mltr("update")}</button>`);
                        InitModal("my_application_detail", modalid);
                    } else {
                        bottom = `
                            <label for="application-new-message" class="form-label">${mltr("message")}</label>
                            <div class="input-group mb-3" style="height:calc(100% - 160px)">
                                <textarea type="text" class="form-control bg-dark text-white" id="application-new-message" placeholder="${mltr("message_placeholder")}" style="height:160px"></textarea>
                            </div>

                            <label for="application-new-status" class="form-label">${mltr("status")}</label>
                            <div class="mb-3">
                                <select class="form-select bg-dark text-white" id="application-new-status">
                                    <option selected>${mltr("select_one_from_the_list")}</option>
                                    <option value="0">${mltr("pending")}</option>
                                    <option value="1">${mltr("accepted")}</option>
                                    <option value="2">${mltr("declined")}</option>
                                </select>
                            </div>`;
                        modalid = ShowModal(mltr("application") + " #" + applicationid, `<div><table>${info}</table></div><br><div>${ret}</div><hr>${bottom}`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("close")}</button><button id="button-application-update-status" type="button" class="btn btn-primary" onclick="UpdateApplicationStatus(${applicationid});">${mltr("update")}</button>`);
                        InitModal("all_application_detail", modalid);
                    }
                    UnlockBtn("#button-all-application-" + applicationid);
                    UnlockBtn("#button-my-application-" + applicationid);
                }
            });
        },
        error: function (data) {
            UnlockBtn("#button-my-application-" + applicationid);
            UnlockBtn("#button-all-application-" + applicationid);
            AjaxError(data);
        }
    })
}

function AddMessageToApplication(applicationid) {
    message = $("#application-new-message").val();
    LockBtn("#button-application-new-message", mltr("updating"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/application",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "applicationid": applicationid,
            "message": message
        },
        success: function (data) {
            UnlockBtn("#button-application-new-message");
            if (data.error) return AjaxError(data);
            GetApplicationDetail(applicationid);
            toastNotification("success", "Success!", mltr("message_added"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-application-new-message");
            AjaxError(data);
        }
    });
}

function UpdateApplicationStatus(applicationid) {
    appstatus = parseInt($("#application-new-status").find(":selected").val());
    if(!isNumber(appstatus)) return toastNotification("error", "Error", mltr("invalid_application_status"))
    message = $("#application-new-message").val();

    LockBtn("#button-application-update-status", mltr("updating"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/application/status",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "applicationid": applicationid,
            "status": appstatus,
            "message": message
        },
        success: function (data) {
            UnlockBtn("#button-application-update-status");
            if (data.error) return AjaxError(data);
            LoadAllApplicationList();
            toastNotification("success", "Success", mltr("application_status_updated"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-application-update-status");
            AjaxError(data);
        }
    })
}

function SubmitApplication() {
    LockBtn("#button-submit-application", mltr("submitting"));

    apptype = parseInt($("#application-type").find(":selected").attr("value"));
    data = {};
    for(var i = 1 ; i <= 100 ; i++){
        if($("#application" + apptype + "Question" + i).length != 0){
            question = applicationQuestions["#application" + apptype + "Question" + i];
            answerid = "application" + apptype + "Answer" + i;
            if($("#" + answerid).length != 0){ // can find by id => text input / textarea / select
                if(!$("#" + answerid).is(':visible')) continue;
                data[question] = $("#" + answerid).val();
            } else if($("input[name='"+answerid+"']").length != 0){ // can find by name => radio / checkbox
                if(!$("input[name='"+answerid+"']").is(':visible')) continue;
                answer = [];
                answert = $("input[name='"+answerid+"']:checked");
                for(var j = 0 ; j < answert.length ; j++){
                    answer.push(answert[j].value);
                }
                answer = answer.join(", ");
                data[question] = answer;
            } else {
                data[question] = "*" + mltr("error_invalid_application_question") + "*";
            }
        } else {
            continue;
        }
    }
    data = JSON.stringify(data);

    $.ajax({
        url: api_host + "/" + dhabbr + "/application",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "application_type": apptype,
            "data": data
        },
        success: function (data) {
            UnlockBtn("#button-submit-application");
            if(data.error) return AjaxError(data);
            toastNotification("success", "Success", mltr("application_submitted"), 5000, false);

            if($("#check-application-enable-notification").prop("checked") == true){
                EnableNotification("discord", mltr("discord"));
                EnableNotification("application", mltr("application"));
            }
        },
        error: function (data) {
            UnlockBtn("#button-submit-application");
            AjaxError(data);
        }
    });
}

function UpdateStaffPositionsShow(){
    content = `
    <div>
        <label class="form-label">Positions</label>
        <div class="input-group mb-2">
            <input id="application-staff-positions" type="text" class="form-control bg-dark text-white flexdatalist" aria-label="${mltr("positions")}" placeholder='${mltr("enter_a_position")}' multiple=''>
        </div>
    </div>`;
    modalid = ShowModal(mltr("update_staff_positions"), content, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("cancel")}</button><button id="button-update-staff-positions" type="button" class="btn btn-primary" onclick="UpdateStaffPositions();">${mltr("update")}</button>`);
    InitModal("update_staff_positions", modalid);
    $('#application-staff-positions').flexdatalist({});
    $("#application-staff-positions").val(positions.join(","));
}

function UpdateStaffPositions() {
    LockBtn("#button-update-staff-positions", mltr("updating"));
    positionstxt = $("#application-staff-positions").val();

    $.ajax({
        url: api_host + "/" + dhabbr + "/application/positions",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "positions": positionstxt
        },
        success: function (data) {
            UnlockBtn("#button-update-staff-positions");
            if (data.error) return AjaxError(data);
            positions = positionstxt.split(",");
            localStorage.setItem("positions", JSON.stringify(positions));
            toastNotification("success", "Success!", mltr("staff_positions_updated"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-update-staff-positions");
            AjaxError(data);
        }
    })
}
challenge_placerholder_row = `
<tr>
    <td style="width:30%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:30%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
</tr>`;

allchallenges = {};

async function LoadChallenge(noplaceholder = false) {
    InitPaginate("#table_challenge_list", "LoadChallenge();");
    page = parseInt($("#table_challenge_list_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;
    if(!noplaceholder){
        $("#table_challenge_list_data").empty();
        for(var i = 0 ; i < 10 ; i++){
            $("#table_challenge_list_data").append(challenge_placerholder_row);
        }
    }
    $.ajax({
        url: api_host + "/" + dhabbr + "/challenge/list?page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            if (data.error) return AjaxError(data);
            
            challengeList = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            while(1){
                if(userPermLoaded && user_distance != null) break;
                await sleep(100);
            }
            if(userPerm.includes("challenge") || userPerm.includes("admin")){
                $("#challenge-new").show();
                $("#button-challenge-edit-delivery").show();
            }

            for (i = 0; i < challengeList.length; i++) {
                challenge = challengeList[i];

                allchallenges[challenge.challengeid] = challenge;
                
                extra = "";
                if(userPerm.includes("challenge") || userPerm.includes("admin")){ extra = `<a id="button-challenge-edit-show-${challenge.challengeid}" class="clickable" onclick="EditChallengeShow(${challenge.challengeid});"><span class="rect-20"><i class="fa-solid fa-pen-to-square"></i></span></a><a id="button-challenge-delete-show-${challenge.challengeid}" class="clickable" onclick="DeleteChallengeShow(${challenge.challengeid}, \`${challenge.title}\`);"><span class="rect-20"><i class="fa-solid fa-trash" style="color:red"></i></span></a>`;}

                CHALLENGE_TYPE = ["", mltr("personal_one_time"), mltr("company_one_time"), mltr("personal_recurring"), mltr("personal_distance_based"), mltr("company_distance_based")];
                challenge_type = CHALLENGE_TYPE[challenge.challenge_type];
                
                pct = Math.min(parseInt(challenge.current_delivery_count / challenge.delivery_count * 100),100);

                progress = `<div class="progress">
                    <div class="progress-bar progress-bar-striped" role="progressbar" style="width:${pct}%" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">${challenge.current_delivery_count} / ${challenge.delivery_count}</div>
                </div>`;

                badge_status = "";

                if(challenge.start_time * 1000 <= +new Date() && challenge.end_time * 1000 >= +new Date()) 
                    badge_status += `<span class="badge text-bg-success">${mltr("ongoing")}</span>`;
                else if(challenge.start_time * 1000 > +new Date())
                    badge_status += `<span class="badge text-bg-info">${mltr("upcoming")}</span>`;
                else if(challenge.end_time * 1000 < +new Date())
                    badge_status += `<span class="badge text-bg-danger">${mltr("ended")}</span>`;
                if(parseInt(challenge.current_delivery_count) >= parseInt(challenge.delivery_count))
                    badge_status += `&nbsp;&nbsp;<span class="badge text-bg-warning">${mltr("completed")}</span>`;
                
                roles = JSON.parse(localStorage.getItem("roles"));
                roleok = false;
                for(j = 0 ; j < challenge.required_roles.length ; j++){
                    if(roles.includes(challenge.required_roles[j])) roleok = true;
                }
                if(!roleok || parseInt(user_distance) < parseInt(challenge.required_distance))
                    badge_status += `&nbsp;&nbsp;<span class="badge text-bg-secondary">${mltr("not_qualified")}</span>`;

                data.push([`<a class="clickable" onclick="ShowChallengeDetail('${challenge.challengeid}')">${challenge.title}</a>`, `${challenge_type}`, `${challenge.reward_points}`, `${progress}`, `${badge_status}`, extra]);
            }

            PushTable("#table_challenge_list", data, total_pages, "LoadChallenge();");
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

function ShowChallengeDetail(challengeid){
    challenge = allchallenges[challengeid];
    function GenTableRow(key, val){
        return `<tr><td><b>${key}</b></td><td>${val}</td></tr>\n`;
    }
    info = "<table><tbody>";
    CHALLENGE_TYPE = ["", mltr("personal_one_time"), mltr("company_one_time"), mltr("personal_recurring"), mltr("personal_distance_based"), mltr("company_distance_based")];
    challenge_type = CHALLENGE_TYPE[challenge.challenge_type];
    info += GenTableRow(mltr("challenge_type"), challenge_type);
    info += GenTableRow(mltr("reward_points"), challenge.reward_points);
    info += GenTableRow(mltr("start_time"), getDateTime(challenge.start_time * 1000));
    info += GenTableRow(mltr("end_time"), getDateTime(challenge.end_time * 1000));

    badge_status = "";
    if(challenge.start_time * 1000 <= +new Date() && challenge.end_time * 1000 >= +new Date()) 
        badge_status += `<span class="badge text-bg-success">${mltr("ongoing")}</span>`;
    else if(challenge.start_time * 1000 > +new Date())
        badge_status += `<span class="badge text-bg-info">${mltr("upcoming")}</span>`;
    else if(challenge.end_time * 1000 < +new Date())
        badge_status += `<span class="badge text-bg-danger">${mltr("ended")}</span>`;
    if(parseInt(challenge.current_delivery_count) >= parseInt(challenge.delivery_count))
        badge_status += `&nbsp;&nbsp;<span class="badge text-bg-warning">${mltr("completed")}</span>`;
    info += GenTableRow(mltr("status"), badge_status);

    info += GenTableRow("&nbsp;", "&nbsp;");
    if(challenge.challenge_type <= 3){
        info += GenTableRow(mltr("deliveries"), challenge.delivery_count);
        info += GenTableRow(mltr("current_deliveries"), challenge.current_delivery_count);
    } else if(challenge.challenge_type <= 5){
        info += GenTableRow(mltr("distance_sum"), challenge.delivery_count);
        info += GenTableRow(mltr("current_distance"), challenge.current_delivery_count);
    }
    pct = Math.min(parseInt(challenge.current_delivery_count / challenge.delivery_count * 100),100);
    progress = `<div class="progress">
        <div class="progress-bar progress-bar-striped" role="progressbar" style="width:${pct}%" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">${pct}%</div>
    </div>`;
    info += GenTableRow(mltr("progress"), progress);
    info += GenTableRow("&nbsp;", "&nbsp;");

    badge_status = "";
    roles = challenge.required_roles;
    rolestxt = "";
    for(var i = 0 ; i < roles.length ; i++){
        rolestxt += `${rolelist[roles[i]]} (${roles[i]}),`
    }
    rolestxt = rolestxt.slice(0,-1);
    info += GenTableRow(mltr("required_roles"), rolestxt);
    info += GenTableRow(mltr("required_distance_driven"), TSeparator(parseInt((challenge.required_distance * distance_ratio))) + distance_unit_txt);
    if(!roleok || parseInt(user_distance) < parseInt(challenge.required_distance))
        badge_status = `<span class="badge text-bg-secondary">${mltr("not_qualified")}</span>`;
    else
        badge_status = `<span class="badge text-bg-success">${mltr("qualified")}</span>`;
    info += GenTableRow(mltr("qualification"), badge_status);
    info += GenTableRow("&nbsp;", "&nbsp;");
    
    completed_users = "";
    completed_users_cnt = {};
    completed_user_info = {};
    completed_user_point = {};
    for (var i = 0; i < challenge.completed.length; i++) {
        if(completed_users_cnt[challenge.completed[i].userid] == undefined) completed_users_cnt[challenge.completed[i].userid] = 1;
        else completed_users_cnt[challenge.completed[i].userid] += 1;
        completed_user_info[challenge.completed[i].userid] = challenge.completed[i];
        completed_user_point[challenge.completed[i].userid] = parseInt(challenge.completed[i].points);
    }
    d = sortDictWithValue(completed_user_point);
    for (var i = 0; i < d.length; i++) {
        extrainfo = "";
        if(challenge.challenge_type == 2) extrainfo = ` <span class="badge text-bg-secondary">${completed_user_info[d[i][0]].points} Points</span>`;
        else if(challenge.challenge_type == 3) extrainfo = ` <span class="badge text-bg-secondary">x${completed_users_cnt[d[i][0]]}</span>`;
        completed_users += `<a style="cursor:pointer" onclick="LoadUserProfile(${d[i][0]})">${completed_user_info[d[i][0]].name}${extrainfo}</a>, `;
    }
    completed_users = completed_users.substr(0, completed_users.length - 2);

    if(challenge.completed.length != 0){
        info += GenTableRow(mltr("completed_members"), completed_users);
        info += GenTableRow("&nbsp;", "&nbsp;");
    }

    info += "</tbody></table>" + marked.parse(challenge.description);
    modalid = ShowModal(challenge.title, info);
    InitModal("challenge_detail", modalid);
}

function CreateChallenge() {
    title = $("#challenge-new-title").val();
    description = simplemde["#challenge-new-description"].value();
    start_time = +new Date($("#challenge-new-start-time").val())/1000;
    end_time = +new Date($("#challenge-new-end-time").val())/1000;    
    challenge_type = $("input[name=challenge-new-type]:checked").val();
    delivery_count = $("#challenge-new-delivery-count").val();
    required_roles = $("#challenge-new-required-roles").val();
    rolest = required_roles.split(",");
    roles = [];
    for (var i = 0; i < rolest.length; i++) {
        s = rolest[i];
        roles.push(s.substr(s.lastIndexOf("(") + 1, s.lastIndexOf(")") - s.lastIndexOf("(") - 1));
    }
    roles = roles.join(",");
    required_roles = roles;
    required_distance = $("#challenge-new-required-distance").val();
    reward_points = $("#challenge-new-reward-points").val();
    public_details = $("input[name=challenge-new-public-details]:checked").val();
    jobreqs = $(".challenge-new-job-requirements");
    jobreqd = {};
    for (var i = 0; i < jobreqs.length; i++) {
        t = jobreqs[i];
        id = $(t).attr("id");
        val = $(t).val();
        if (val == "") continue;
        if (id == "#challenge-new-allow-auto") {
            if (val == "none") {
                jobreqd["allow_auto_park"] = 0;
                jobreqd["allow_auto_load"] = 0;
            } else if (val == "auto-park") {
                jobreqd["allow_auto_park"] = 1;
                jobreqd["allow_auto_load"] = 0;
            } else if (val == "auto-load") {
                jobreqd["allow_auto_park"] = 0;
                jobreqd["allow_auto_load"] = 1;
            } else if (val == "both") {
                jobreqd["allow_auto_park"] = 1;
                jobreqd["allow_auto_load"] = 1;
            }
        } else {
            jobreqd[id.substr(14).replaceAll("-", "_")] = val;
        }
    }
    
    LockBtn("#button-challenge-new-create", mltr("creating"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/challenge",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "title": title,
            "description": description,
            "start_time": start_time,
            "end_time": end_time,
            "challenge_type": challenge_type,
            "delivery_count": delivery_count,
            "required_roles": required_roles,
            "required_distance": required_distance,
            "reward_points": reward_points,
            "public_details": public_details,
            "job_requirements": JSON.stringify(jobreqd)
        },
        success: function (data) {
            UnlockBtn("#button-challenge-new-create");
            if (data.error) return AjaxError(data);
            LoadChallenge(noplaceholder = true);
            toastNotification("success", "Success", mltr("challenge_created"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-challenge-new-create");
            AjaxError(data);
        }
    });
}

function EditChallengeShow(challengeid){
    $.ajax({
        url: api_host + "/" + dhabbr + "/challenge?challengeid="+challengeid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            d = data.response.challenge;
            $("#challenge-edit").show();
            $("#challenge-edit-id-span").html(challengeid);
            $("#button-challenge-edit").attr("onclick", `EditChallenge(${challengeid})`);
            $("#challenge-edit-title").val(d.title);
            simplemde["#challenge-edit-description"].value(d.description);
            $("#challenge-edit-start-time").val(new Date(d.start_time*1000).toISOString().slice(0,-1));
            $("#challenge-edit-end-time").val(new Date(d.end_time*1000).toISOString().slice(0,-1));
            $("#challenge-edit-type-"+d.challenge_type).prop("checked", true);
            $("#challenge-edit-delivery-count").val(d.delivery_count);
            roles = d.required_roles;
            rolestxt = "";
            for(var i = 0 ; i < roles.length ; i++){
                rolestxt += `${rolelist[roles[i]]} (${roles[i]}),`
            }
            rolestxt = rolestxt.slice(0,-1);
            $("#challenge-edit-required-roles").val(rolestxt);
            $("#challenge-edit-required-distance").val(d.required_distance);
            $("#challenge-edit-reward-points").val(d.reward_points);
            $("#challenge-edit-public-details-"+JSON.stringify(d.public_details)).prop("checked", true);
            jobreqd = d.job_requirements;
            jobreqs = $(".challenge-edit-job-requirements");
            for (var i = 0; i < jobreqs.length; i++) {
                t = jobreqs[i];
                id = $(t).attr("id");
                val = jobreqd[id.substr(15).replaceAll("-", "_")];
                if(val == undefined || val == "-1") continue;
                if (id == "#challenge-edit-allow-auto") {
                    t = 0;
                    if(jobreqd["allow_auto_park"]) autopark += 1;
                    if(jobreqd["allow_auto_load"]) autopark += 2;
                    if(autopark == 0) $(t).val("none");
                    else if(autopark == 1) $(t).val("auto-park");
                    else if(autopark == 2) $(t).val("auto-load");
                    else if(autopark == 3) $(t).val("both");
                } else {
                    $(t).val(jobreqd[id.substr(15).replaceAll("-", "_")]);
                }
            }
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

function EditChallenge(challengeid) {
    LockBtn("#button-challenge-edit", mltr("editing"));
    title = $("#challenge-edit-title").val();
    description = simplemde["#challenge-edit-description"].value();
    start_time = +new Date($("#challenge-edit-start-time").val())/1000;
    end_time = +new Date($("#challenge-edit-end-time").val())/1000;    
    challenge_type = $("input[name=challenge-edit-type]:checked").val();
    delivery_count = $("#challenge-edit-delivery-count").val();
    required_roles = $("#challenge-edit-required-roles").val();
    rolest = required_roles.split(",");
    roles = [];
    for (var i = 0; i < rolest.length; i++) {
        s = rolest[i];
        roles.push(s.substr(s.lastIndexOf("(") + 1, s.lastIndexOf(")") - s.lastIndexOf("(") - 1));
    }
    roles = roles.join(",");
    required_roles = roles;
    required_distance = $("#challenge-edit-required-distance").val();
    reward_points = $("#challenge-edit-reward-points").val();
    public_details = $("input[name=challenge-edit-public-details]:checked").val();
    jobreqs = $(".challenge-edit-job-requirements");
    jobreqd = {};
    for (var i = 0; i < jobreqs.length; i++) {
        t = jobreqs[i];
        id = $(t).attr("id");
        val = $(t).val();
        if (val == "") continue;
        if (id == "#challenge-edit-allow-auto") {
            if (val == "none") {
                jobreqd["allow_auto_park"] = 0;
                jobreqd["allow_auto_load"] = 0;
            } else if (val == "auto-park") {
                jobreqd["allow_auto_park"] = 1;
                jobreqd["allow_auto_load"] = 0;
            } else if (val == "auto-load") {
                jobreqd["allow_auto_park"] = 0;
                jobreqd["allow_auto_load"] = 1;
            } else if (val == "both") {
                jobreqd["allow_auto_park"] = 1;
                jobreqd["allow_auto_load"] = 1;
            }
        } else {
            jobreqd[id.substr(15).replaceAll("-", "_")] = val;
        }
    }
    
    LockBtn("#button-challenge-edit-create", mltr("creating"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/challenge?challengeid="+challengeid,
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "title": title,
            "description": description,
            "start_time": start_time,
            "end_time": end_time,
            "challenge_type": challenge_type,
            "delivery_count": delivery_count,
            "required_roles": required_roles,
            "required_distance": required_distance,
            "reward_points": reward_points,
            "public_details": public_details,
            "job_requirements": JSON.stringify(jobreqd)
        },
        success: function (data) {
            UnlockBtn("#button-challenge-edit");
            if (data.error) return AjaxError(data);
            LoadChallenge(noplaceholder = true);
            toastNotification("success", "Success", mltr("challenge_edited"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-challenge-edit");
            AjaxError(data);
        }
    });
}

function DeleteChallengeShow(challengeid, title){
    if(shiftdown) return DeleteChallenge(challengeid);
    modalid = ShowModal(mltr("delete_challenge"), `<p>${mltr("delete_challenge_note")}</p><p><i>${title}</i></p><br><p style="color:#aaa"><span style="color:lightgreen">${mltr("delete_protip")}`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("cancel")}</button><button id="button-challenge-delete-${challengeid}" type="button" class="btn btn-danger" onclick="DeleteChallenge(${challengeid});">${mltr("delete")}</button>`);
    InitModal("delete_challenge", modalid);
}

function DeleteChallenge(challengeid){
    LockBtn("#button-challenge-delete-"+challengeid, mltr("deleting"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/challenge?challengeid=" + challengeid,
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            UnlockBtn("#button-challenge-delete-"+challengeid);
            if (data.error) AjaxError(data);
            LoadChallenge(noplaceholder = true);
            toastNotification("success", "Success", mltr("challenge_deleted"), 5000, false);
            if(Object.keys(modals).includes("delete_challenge")) DestroyModal("delete_challenge");
        },
        error: function (data) {
            UnlockBtn("#button-challenge-delete-"+challengeid);
            AjaxError(data);
        }
    });
}

function EditChallengeDeliveryShow(){
    div = `
    <label for="challenge-challenge-id" class="form-label">${mltr('challenge_id')}</label>
    <div class="input-group mb-2">
        <input type="number" class="form-control bg-dark text-white" id="challenge-challenge-id" placeholder="0">
    </div>
    <label for="challenge-dlog-id" class="form-label">${mltr('delivery_log_id')}</label>
    <div class="input-group mb-3">
        <input type="number" class="form-control bg-dark text-white" id="challenge-dlog-id" placeholder="0">
    </div>`;
    modalid = ShowModal(mltr('challenge_delivery'), div, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('close')}</button><button id="button-challenge-delete-delivery" type="button" class="btn btn-danger" onclick="DeleteChallengeDelivery();">${mltr('delete')}</button><button id="button-challenge-add-delivery" type="button" class="btn btn-success" onclick="AddChallengeDelivery();">${mltr('add')}</button>`);
    InitModal("edit_challenge_delivery", modalid);
}

function AddChallengeDelivery(){
    LockBtn("#button-challenge-add-delivery", mltr("adding"));
    challengeid = $("#challenge-challenge-id").val();
    logid = $("#challenge-dlog-id").val();
    $.ajax({
        url: api_host + "/" + dhabbr + "/challenge/delivery?challengeid=" + challengeid,
        type: "PUT",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "logid": logid
        },
        success: function (data) {
            UnlockBtn("#button-challenge-add-delivery");
            if (data.error) AjaxError(data);
            LoadChallenge(noplaceholder = true);
            toastNotification("success", "Success", mltr("delivery_added"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-challenge-add-delivery");
            AjaxError(data);
        }
    });
}

function DeleteChallengeDelivery(){
    LockBtn("#button-challenge-delete-delivery", mltr("deleting"));
    challengeid = $("#challenge-challenge-id").val();
    logid = $("#challenge-dlog-id").val();
    $.ajax({
        url: api_host + "/" + dhabbr + "/challenge/delivery?challengeid=" + challengeid+"&logid="+logid,
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            UnlockBtn("#button-challenge-delete-delivery");
            if (data.error) AjaxError(data);
            LoadChallenge(noplaceholder = true);
            toastNotification("success", "Success", mltr("delivery_deleted"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-challenge-delete-delivery");
            AjaxError(data);
        }
    });
}
division_placeholder_row = `
<div class="shadow p-3 mb-3 bg-dark rounded col card">
    <h5 class="card-title"><strong><span class="placeholder" style="width:150px"></span></strong></h5>
    <p class="card-text"><span class="rect-20"><i class="fa-solid fa-user-group"></i></span> <span class="placeholder" style="width:100px"></span></p>
    <p class="card-text"><span class="rect-20"><i class="fa-solid fa-coins"></i></span> <span class="placeholder" style="width:120px"></span></p>
</div>`;

division_pending_row = `<tr>
<td style="width:25%;"><span class="placeholder w-100"></span></td>
<td style="width:25%;"><span class="placeholder w-100"></span></td>
<td style="width:50%;"><span class="placeholder w-100"></span></td>
</tr>`;

function LoadDivisionDeliveryList(noplaceholder = false) {
    if(!noplaceholder){
        $("#table_division_delivery_data").empty();
        for (var i = 0; i < 10; i++) {
            $("#table_division_delivery_data").append(dlog_placeholder_row);
        }
    }
    InitPaginate("#table_division_delivery", "LoadDivisionDeliveryList();");
    page = parseInt($("#table_division_delivery_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;
    $.ajax({
        url: api_host + "/" + dhabbr + "/dlog/list?page=" + page + "&page_size=20&division=only",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            deliverylist = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < deliverylist.length; i++) {
                delivery = deliverylist[i];
                user = delivery.user;
                distance = TSeparator(parseInt(delivery.distance * distance_ratio));
                cargo_mass = parseInt(delivery.cargo_mass / 1000) + "t";
                unittxt = "€";
                if (delivery.unit == 2) unittxt = "$";
                profit = TSeparator(delivery.profit);
                color = "";
                if (delivery.profit < 0) color = "grey";
                dextra = "";
                if (delivery.division != "") dextra = `<span title='${mltr("validated_division_delivery")}'>` + SVG_VERIFIED + "</span>";

                dloguser = GetAvatar(user.userid, user.name, user.discordid, user.avatar);

                data.push([`<tr_style>color:${color}</tr_style>`, `${delivery.logid} ${dextra}`, `${dloguser}`, `${delivery.source_company}, ${delivery.source_city}`, `${delivery.destination_company}, ${delivery.destination_city}`, `${distance}${distance_unit_txt}`, `${delivery.cargo} (${cargo_mass})`, `${unittxt}${profit}`, `<a class="clickable" onclick="ShowDeliveryDetail('${delivery.logid}')"><i class="fa-solid fa-folder-open"></i></a>`]);
            }

            PushTable("#table_division_delivery", data, total_pages, "LoadDivisionDeliveryList();");
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

async function LoadDivisionInfo(noplaceholder = false) {
    if (!noplaceholder) {
        $("#division-summary-list").children().remove();
        for (var i = 0; i < 3; i++) {
            $("#division-summary-list").append(division_placeholder_row);
        }
    }
    $.ajax({
        url: api_host + "/" + dhabbr + "/division",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            info = data.response;

            $("#division-summary-list").children().remove();
            for (var i = 0; i < info.length; i++) {
                divisionid = info[i].divisionid;
                divisionname = info[i].name;
                totaldrivers = TSeparator(info[i].total_drivers);
                totalpnt = TSeparator(info[i].total_points);
                $("#division-summary-list").append(`
                <div class="shadow p-3 mb-3 bg-dark rounded col card">
                    <h5 class="card-title"><strong>${divisionname}</strong></h5>
                    <p class="card-text"><span class="rect-20"><i class="fa-solid fa-user-group"></i></span> ${totaldrivers} Drivers</p>
                    <p class="card-text"><span class="rect-20"><i class="fa-solid fa-coins"></i></span> ${totalpnt} Points</p>
                </div>`);
            }
        },
        error: function (data) {
            AjaxError(data);
        }
    });
    LoadDivisionDeliveryList(noplaceholder = noplaceholder);
    while (1) {
        if (userPermLoaded) break;
        await sleep(100);
    }
    if (userPerm.includes("division") || userPerm.includes("admin")) {
        $("#division-pending-list").show();
        LoadPendingDivisionValidation();
    }
}

function GetDivisionInfo(logid) {
    LockBtn("#button-delivery-detail-division", mltr("checking"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/division?logid=" + logid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            UnlockBtn("#button-delivery-detail-division");
            if (data.error) return AjaxError(data);

            divisionopt = "";
            for (var i = 0; i < Object.keys(divisions).length; i++) {
                divisionopt += `<option value="${divisions[Object.keys(divisions)[i]].id}" id="division-${divisions[Object.keys(divisions)[i]].id}">${divisions[Object.keys(divisions)[i]].name}</option>`;
            }
            if (divisionopt == "") return $("#delivery-detail-division").html(`<span style="color:red">${mltr("no_division_found")}</span>`);

            info = ``;
            if (data.response.status == "-1") {
                info += `
                <select class="form-select bg-dark text-white" id="select-division">
                    <option value="-1" selected>${mltr("select_division")}</option>
                    ${divisionopt}
                </select>`;
                info += `<button id="button-request-division-validation" type="button" class="btn btn-primary"  onclick="SubmitDivisionValidationRequest(${logid});">${mltr("request_validation")}</button>`;
                $("#delivery-detail-division").html(info);
            } else if ((userPerm.includes("division") || userPerm.includes("admin")) && data.response.status == "0") {
                info += `
                <p>${mltr("division_pending_validation")}</p>
                <label for="select-division" class="form-label">${mltr("divisions")}</label>
                <div class="mb-3">
                    <select class="form-select bg-dark text-white" id="select-division">
                        ${divisionopt}
                    </select>
                </div>
                <label for="validate-division-message" class="form-label">${mltr("message")}</label>
                <div class="input-group mb-3" style="height:100px;">
                    <textarea type="text" class="form-control bg-dark text-white" id="validate-division-message" placeholder="" style="height:100%"></textarea>
                </div>
                `;
                modalid = ShowModal(mltr('division_validation'), info, `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button>
                <button id="button-division-danger" type="button" class="btn btn-danger" onclick="UpdateDivision(${logid}, 2);">${mltr('reject')}</button>
                <button id="button-division-accept" type="button" class="btn btn-success" onclick="UpdateDivision(${logid}, 1);">${mltr('accept')}</button>`);
                InitModal("division_detail", modalid, top = true);
                $("#division-" + data.response.divisionid).prop("selected", true);
            } else {
                if (data.response.update_message == undefined) {
                    $("#delivery-detail-division").html(divisions[data.response.divisionid].name);
                } else {
                    info += divisions[data.response.divisionid].name + " ";
                    if (data.response.status == "0") info += "| " + mltr("pending_validation");
                    else if (data.response.status == "1") info += SVG_VERIFIED;
                    else if (data.response.status == "2") {
                        staff = data.response.update_staff;
                        staff = GetAvatar(staff.userid, staff.name, staff.discordid, staff.avatar);
                        info += `| ${mltr("rejected_by")} ` + staff;
                    }
                }
                if (userPerm.includes("division") || userPerm.includes("admin")) {
                    modalid = ShowModal(mltr('division_validation'), info, `
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('close')}</button>
                    <button id="button-division-revalidate" type="button" class="btn btn-primary" onclick="UpdateDivision(${logid}, 0);">${mltr('revalidate')}</button>`);
                    InitModal("division_detail", modalid, top = true);
                } else {
                    $("#delivery-detail-division").html(info);
                }
            }
        },
        error: function (data) {
            UnlockBtn("#button-delivery-detail-division");
            errmsg = JSON.parse(data.responseText).descriptor ? JSON.parse(data.responseText).descriptor : data.status + " " + data.statusText;
            $("#delivery-detail-division").html(`<span style="color:red">${errmsg}</span>`);
        }
    });
}

function SubmitDivisionValidationRequest(logid) {
    divisionid = $("#select-division").find(":selected").val();
    if (divisionid == "-1") return toastNotification("error", "Error", mltr("invalid_division"), 5000, false);

    LockBtn("#button-request-division-validation", mltr("requesting"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/division?divisionid=" + divisionid,
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            logid: logid
        },
        success: async function (data) {
            UnlockBtn("#button-request-division-validation");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", mltr("request_submitted"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-request-division-validation");
            AjaxError(data);
        }
    });
}

function LoadPendingDivisionValidation() {
    InitPaginate("#table_division_pending", "LoadPendingDivisionValidation();");
    page = parseInt($("#table_division_pending_page_input").val())
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    
    $("#table_division_pending_data").empty();
    for (var i = 0; i < 5; i++) {
        $("#table_division_pending_data").append(division_pending_row);
    }
    $.ajax({
        url: api_host + "/" + dhabbr + "/division/list/pending?page_size=20&page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            total_pages = data.response.total_pages;
            pending_division = data.response.list;
            data = [];

            for (i = 0; i < pending_division.length; i++) {
                delivery = pending_division[i];
                user = delivery.user;
                data.push([`${delivery.logid}`,`${divisions[delivery.divisionid].name}`,`${GetAvatar(user.userid, user.name, user.discordid, user.avatar)}`,`<a class="clickable" onclick="ShowDeliveryDetail(${delivery.logid})">${mltr("show_details")}</a>`]);
            }

            PushTable("#table_division_pending", data, total_pages, "LoadPendingDivisionValidation();");
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function UpdateDivision(logid, status) {
    divisionid = "-1";
    if (status >= 1) {
        divisionid = $("#select-division").find(":selected").val();
        if (divisionid == "-1") return toastNotification("error", "Error", mltr("invalid_division"), 5000, false);
    }

    if (status == 1) {
        LockBtn("#button-division-accept", mltr("accepting"));
        $("#button-division-reject").attr("disabled", "disabled");
    } else if (status == 2) {
        LockBtn("#button-division-reject", mltr("rejecting"));
        $("#button-division-accept").attr("disabled", "disabled");
    } else if (status == 0) {
        LockBtn("#button-division-revalidate", mltr("requesting"));
    }

    message = $("#validate-division-message").val();
    if (message == undefined || message == null) message = "";

    $.ajax({
        url: api_host + "/" + dhabbr + "/division?divisionid=" + divisionid,
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            logid: logid,
            status: status,
            message: message
        },
        success: function (data) {
            if (status == 1) {
                UnlockBtn("#button-division-accept");
                $("#button-division-reject").removeAttr("disabled");
            } else if (status == 2) {
                UnlockBtn("#button-division-reject");
                $("#button-division-accept").removeAttr("disabled");
            } else if (status == 0) {
                UnlockBtn("#button-division-revalidate");
            }
            if (data.error) return AjaxError(data);
            GetDivisionInfo(logid);
            if (status == 1) {
                toastNotification("success", "Success", mltr("division_delivery_accepted"), 5000, false);
            } else if (status == 2) {
                toastNotification("success", "Success", mltr("division_delivery_rejected"), 5000, false);
            } else if (status == 0) {
                toastNotification("success", "Success", mltr("division_delivery_validation_status_updated_to_pending"), 5000, false);
            }
        },
        error: function (data) {
            if (status == 1) {
                UnlockBtn("#button-division-accept");
                $("#button-division-reject").removeAttr("disabled");
            } else if (status == 2) {
                UnlockBtn("#button-division-reject");
                $("#button-division-accept").removeAttr("disabled");
            } else if (status == 0) {
                UnlockBtn("#button-division-revalidate");
            }
            AjaxError(data);
        }
    });
}
downloads_placeholder_row = `<div class="row">
<div class="downloads shadow p-3 m-3 bg-dark rounded col">
    <h5><strong><span class="placeholder col-2"></span> <span class="placeholder col-7"></span></strong></h5>
    <h6 style="font-size:15px"><span class="placeholder col-3"></span> <span class="placeholder col-4"></span></h6>
    <p><span class="placeholder col-3"></span>&nbsp;&nbsp;<span class="placeholder col-6"></span></p>
    <p><span class="placeholder col-5"></span>&nbsp;&nbsp;<span class="placeholder col-4"></span></p>
</div>
<div class="downloads shadow p-3 m-3 bg-dark rounded col">
    <h5><strong><span class="placeholder col-2"></span> <span class="placeholder col-7"></span></strong></h5>
    <h6 style="font-size:15px"><span class="placeholder col-3"></span> <span class="placeholder col-4"></span></h6>
    <p><span class="placeholder col-3"></span>&nbsp;&nbsp;<span class="placeholder col-6"></span></p>
    <p><span class="placeholder col-5"></span>&nbsp;&nbsp;<span class="placeholder col-4"></span></p>
</div>
</div>`;

alldownloads = {};

function LoadDownloads(noplaceholder = false){
    InitPaginate("#downloads", "LoadDownloads()");
    $("#downloads-tab .page-item").addClass("disabled");

    if(!noplaceholder){
        $("#downloads").children().remove();
        for(i = 0 ; i < 5 ; i++){
            $("#downloads").append(downloads_placeholder_row);
        }
    }

    page = parseInt($("#downloads_page_input").val());

    if(userPerm.includes("downloads") || userPerm.includes("admin")){
        $("#downloads-new").show();
    }

    $.ajax({
        url: api_host + "/" + dhabbr + "/downloads/list?page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: async function (data) {
            while(1){
                if(userPermLoaded) break;
                await sleep(100);
            }
            if(userPerm.includes("downloads") || userPerm.includes("admin")){
                $("#downloads-new").show();
            }
            downloadslist = data.response.list;
            content = "";
            for (i = 0; i < downloadslist.length; i++) {
                if(i % 2 == 0){
                    if(i != 0) content += `</div>`;
                    content += `<div class="row">`;
                }
                downloads = downloadslist[i];
                alldownloads[downloadslist[i].downloadsid] = downloadslist[i];
                creator = downloads.creator;
                downloads_control = `<div style="float:right"><a style="cursor:pointer" onclick="DownloadsRedirect(${downloads.downloadsid});"><span class="rect-20"><i class="fa-solid fa-download"></i></span></a>`;
                downloads_control_title_style = "";
                downloads_control_top = "";
                downloads_control_bottom = "";
                if(userPerm.includes("downloads") || userPerm.includes("admin")){
                    downloads_control += `<a style="cursor:pointer" onclick="EditDownloadsShow(${downloads.downloadsid})"><span class="rect-20"><i class="fa-solid fa-pen-to-square"></i></span></a><a style="cursor:pointer" onclick="DeleteDownloadsShow(${downloads.downloadsid})"><span class="rect-20"><i class="fa-solid fa-trash" style="color:red"></i></span></a></div>`;
                    downloads_control_title_style = `width:calc(100% - 100px)`;
                    downloads_control_top = `<input type="text" class="form-control bg-dark text-white" id="downloads-edit-${downloads.downloadsid}-title" placeholder="A short and nice title" value="${downloads.title}" style="display:none;width:100%;">`;
                    downloads_control_bottom = `<div id="downloads-edit-${downloads.downloadsid}-bottom-div" style="display:none;"><div class="input-group mb-3" style="height:calc(100% + 50px)">
                        <textarea type="text" class="form-control bg-dark text-white" id="downloads-edit-${downloads.downloadsid}-description" placeholder="Content of the downloadable item, MarkDown supported" style="height:100%">${downloads.description}</textarea></div>
                    <label for="downloads-edit-${downloads.downloadsid}-link" class="form-label">Link</label>
                    <div class="input-group mb-2">
                        <input type="text" class="form-control bg-dark text-white" id="downloads-edit-${downloads.downloadsid}-link" placeholder="https://..." value="${convertQuotation2(downloads.link)}">
                    </div>
                    <label for="downloads-edit-${downloads.downloadsid}-orderid" class="form-label">Order ID</label>
                    <div class="input-group mb-2">
                        <input type="text" class="form-control bg-dark text-white" id="downloads-edit-${downloads.downloadsid}-orderid" placeholder="0" value="${downloads.orderid}">
                    </div>
                    <button id="button-downloads-edit-${downloads.downloadsid}-save" type="button" class="btn btn-primary" style="float:right" onclick="EditDownloads(${downloads.downloadsid});">Save</button></div>
                    `;
                } else {
                    downloads_control += "</div>";
                }
                content += `<div class="downloads shadow p-3 m-3 bg-dark rounded col" id="downloads-${downloads.downloadsid}">
                    <h5 style="display:inline-block;${downloads_control_title_style}"><strong><span id="downloads-display-${downloads.downloadsid}-title"> ${downloads.title}</span>${downloads_control_top}</strong></h5>
                    ${downloads_control}
                    <h6 style="font-size:15px"><strong>${GetAvatar(creator.userid, creator.name, creator.discordid, creator.avatar)} | ${downloads.click_count} Downloads</strong></h6>
                    <div id="downloads-display-${downloads.downloadsid}-description">${marked.parse(downloads.description.replaceAll("\n", "<br>")).replaceAll("<img ", "<img style='width:100%;' ")}</div>
                    ${downloads_control_bottom}
                </div>`;
            }
            content += `</div>`;
            $("#downloads").children().remove();
            $("#downloads").append(content);
            UpdatePaginate("#downloads", data.response.total_pages, "LoadDownloads();");
        }
    });
}

function DownloadsRedirect(downloadsid){
    $.ajax({
        url: api_host + "/" + dhabbr + "/downloads?downloadsid=" + downloadsid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            UnlockBtn("#button-downloads-redirect-"+downloadsid);
            if(data.error) return AjaxError(data);
            window.location.href = api_host + "/" + dhabbr + "/downloads/" + data.response.downloads.secret;
        },
        error: function (data){
            UnlockBtn("#button-downloads-redirect-"+downloadsid);
            AjaxError(data);
        }
    });
}

function CreateDownloads(){
    title = $("#downloads-new-title").val();
    description = simplemde["#downloads-new-description"].value();
    link = $("#downloads-new-link").val();
    orderid = $("#downloads-new-orderid").val();

    LockBtn("#button-downloads-new-create", mltr("creating"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/downloads",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "title": title,
            "description": description,
            "link": link,
            "orderid": orderid
        },
        success: function (data) {
            UnlockBtn("#button-downloads-new-create");
            if (data.error) return AjaxError(data);
            LoadDownloads(noplaceholder = true);
            toastNotification("success", "Success", mltr("downloadable_item_added"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-downloads-new-create");
            AjaxError(data);
        }
    });
}

function EditDownloadsShow(downloadsid){
    $(`#downloads-edit-${downloadsid}-bottom-div`).css("height", ($(`#downloads-display-${downloadsid}-content`).height()) + "px");
    $(`#downloads-edit-${downloadsid}-bottom-div`).toggle();
    $(`#downloads-edit-${downloadsid}-title`).toggle();
    $(`#downloads-display-${downloadsid}-description`).toggle();
    $(`#downloads-display-${downloadsid}-title`).toggle();
}

function EditDownloads(downloadsid){
    title = $(`#downloads-edit-${downloadsid}-title`).val();
    description = $(`#downloads-edit-${downloadsid}-description`).val();
    link = $(`#downloads-edit-${downloadsid}-link`).val();
    orderid = $(`#downloads-edit-${downloadsid}-orderid`).val();

    LockBtn(`#button-downloads-edit-${downloadsid}-save`, mltr("editing"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/downloads?downloadsid="+downloadsid,
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "title": title,
            "description": description,
            "link": link,
            "orderid": orderid
        },
        success: function (data) {
            UnlockBtn(`#button-downloads-edit-${downloadsid}-save`);
            if (data.error) return AjaxError(data);
            LoadDownloads(noplaceholder = true);
            toastNotification("success", "Success", mltr("downloadable_item_edited"), 5000, false);
        },
        error: function (data) {
            UnlockBtn(`#button-downloads-edit-${downloadsid}-save`);
            AjaxError(data);
        }
    });
}

function DeleteDownloadsShow(downloadsid){
    if(shiftdown) return DeleteDownloads(downloadsid);
    title = alldownloads[downloadsid].title;
    modalid = ShowModal(mltr("delete_downloadable_item"), `<p>${mltr("delete_downloadable_item_note")}</p><p><i>${title}</i></p><br><p style="color:#aaa"><span style="color:lightgreen">${mltr("delete_protip")}`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("cancel")}</button><button id="button-downloads-delete-${downloadsid}" type="button" class="btn btn-danger" onclick="DeleteDownloads(${downloadsid});">${mltr("delete")}</button>`);
    InitModal("delete_downloads", modalid);
}

function DeleteDownloads(downloadsid){
    LockBtn("#button-downloads-delete-"+downloadsid, mltr("deleting"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/downloads?downloadsid=" + downloadsid,
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            UnlockBtn("#button-downloads-delete-"+downloadsid);
            if (data.error) AjaxError(data);
            LoadDownloads(noplaceholder = true);
            toastNotification("success", "Success", mltr("downloadable_item_deleted"), 5000, false);
            if(Object.keys(modals).includes("delete_downloads")) DestroyModal("delete_downloads");
        },
        error: function (data) {
            UnlockBtn("#button-downloads-delete-"+downloadsid);
            AjaxError(data);
        }
    });
}
allevents = {};

event_placerholder_row = `
<tr>
    <td style="width:calc(100% - 480px - 40%);"><span class="placeholder w-100"></span></td>
    <td style="width:calc(100% - 480px - 25%);"><span class="placeholder w-100"></span></td>
    <td style="width:calc(100% - 480px - 25%);"><span class="placeholder w-100"></span></td>
    <td style="width:120px;"><span class="placeholder w-100"></span></td>
    <td style="width:180px;"><span class="placeholder w-100"></span></td>
    <td style="width:180px;"><span class="placeholder w-100"></span></td>
    <td style="width:calc(100% - 480px - 10%);"><span class="placeholder w-100"></span></td>
</tr>`;

async function LoadEvent(noplaceholder = false) {
    if (eventsCalendar == undefined || force) {
        $.ajax({
            url: api_host + "/" + dhabbr + "/event/all",
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: async function (data) {
                if (data.error) return AjaxError(data.response);
                d = data.response.list;
                var eventlist = [];
                offset = (+new Date().getTimezoneOffset()) * 60 * 1000;
                for (var i = 0; i < d.length; i++) {
                    eventlist.push({
                        "title": d[i].title,
                        "url": "/event/" + d[i].eventid,
                        "start": new Date(d[i].meetup_timestamp * 1000 - offset).toISOString().slice(0,-1).substring(0, 10)
                    })
                }

                var eventsCalendarEl = document.getElementById('events-calendar');
                var eventsCalendar = new FullCalendar.Calendar(eventsCalendarEl, {
                    initialView: 'dayGridMonth',
                    headerToolbar: {
                        left: 'prev,next today',
                        center: 'title'
                    },
                    eventClick: function (info) {
                        info.jsEvent.preventDefault();
                        eventid = info.event.url.split("/")[2];
                        ShowEventDetail(eventid);
                    },
                    events: eventlist,
                    height: 'auto'
                });
                eventsCalendar.render();
            },
            error: function (data) {
                AjaxError(data);
            }
        })
    }

    InitPaginate("#table_event_list", "LoadEvent();");
    page = parseInt($("#table_event_list_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;
    if(!noplaceholder){
        $("#table_event_list_data").empty();
        for(var i = 0 ; i < 10 ; i++){
            $("#table_event_list_data").append(event_placerholder_row);
        }
    }
    $.ajax({
        url: api_host + "/" + dhabbr + "/event/list?page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            if (data.error) return AjaxError(data);
            
            eventList = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            while(1){
                if(userPermLoaded) break;
                await sleep(100);
            }
            if(userPerm.includes("event") || userPerm.includes("admin")){
                $("#event-new").show();
            }

            for (i = 0; i < eventList.length; i++) {
                event = eventList[i];
                allevents[event.eventid] = event;
                meetup_timestamp = event.meetup_timestamp * 1000;
                departure_timestamp = event.departure_timestamp * 1000;
                now = +new Date();
                style = "";
                if (now >= meetup_timestamp - 1000 * 60 * 60 * 6) style = "color:lightblue";
                if (now >= meetup_timestamp && now <= departure_timestamp + 1000 * 60 * 30) style = "color:lightgreen"
                if (now > departure_timestamp + 1000 * 60 * 30) style = "color:grey";
                mt = getDateTime(meetup_timestamp);
                dt = getDateTime(departure_timestamp);
                votecnt = event.votes.length;
                pvt = "";
                if (event.is_private) pvt = SVG_LOCKED;
                
                extra = "";
                if(userPerm.includes("event") || userPerm.includes("admin")){ extra = `<a id="button-event-edit-show-${event.eventid}" class="clickable" onclick="EditEventShow(${event.eventid});"><span class="rect-20"><i class="fa-solid fa-pen-to-square"></i></span></a><a id="button-event-delete-show-${event.eventid}" class="clickable" onclick="DeleteEventShow(${event.eventid});"><span class="rect-20"><i class="fa-solid fa-trash" style="color:red"></i></span></a>`;}

                data.push([`<tr_style>${style}</tr_style>`, `<a class="clickable" onclick="ShowEventDetail('${event.eventid}')">${pvt} ${event.title}</a>`, `${event.departure}`, `${event.destination}`, `${event.distance}`, `${mt.replaceAll(",",",<br>")}`, `${dt.replaceAll(",",",<br>")}`, `${votecnt}`, extra]);
            }

            PushTable("#table_event_list", data, total_pages, "LoadEvent();");
        },
        error: function (data) {
            AjaxError(data);
        }
    });
    while(1){
        if(userPermLoaded) break;
        await sleep(100);
    }
    if(userPerm.includes("event") || userPerm.includes("admin")){
        $("#event-new").show();
    }
}

async function ShowEventDetail(eventid, reload = false) {
    if (Object.keys(allevents).indexOf(String(eventid)) == -1 || reload) {
        $.ajax({
            url: api_host + "/" + dhabbr + "/event?eventid=" + eventid,
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                if (data.error) return AjaxError(data);
                allevents[eventid] = data.response.event;
                ShowEventDetail(eventid);
            },
            error: function (data) {
                return AjaxError(data);
            }
        });
        return;
    }
    event = allevents[eventid];
    voteop = `<a style="cursor:pointer;color:grey" onclick="VoteEvent(${eventid}, 'Voted')">(Vote)</a>`;
    vote = "";
    userid = localStorage.getItem("userid");
    for (i = 0; i < event.votes.length; i++) {
        vote += `<a style="cursor:pointer" onclick="LoadUserProfile(${event.votes[i].userid})">${event.votes[i].name}</a>, `;
        if (event.votes[i].userid == String(userid)) {
            voteop = `<a style="cursor:pointer;color:grey" onclick="VoteEvent(${eventid}, 'Unvoted')">(Unvote)</a>`;
        }
    }
    vote = vote.substr(0, vote.length - 2);
    votecnt = event.votes.length;
    attendee = "";
    for (i = 0; i < event.attendees.length; i++) {
        attendee += `<a style="cursor:pointer" onclick="LoadUserProfile(${event.attendees[i].userid})">${event.attendees[i].name}</a>, `;
    }
    attendee = attendee.substr(0, attendee.length - 2);
    attendeeop = "";
    if(userPerm.includes("event") || userPerm.includes("admin")){
        attendeeop = `<a style="cursor:pointer;color:grey" onclick="EditAttendeeShow(${event.eventid})">Edit</a>`;
    }

    distance = "&nbsp;";
    if(event.distance != "") distance = event.distance;
    info = `
    <div class="row w-100">
        <div class="col-5 m-auto" style="text-align:center">
            <p style="font-size:25px;"><b>${event.departure}</b></p>
        </div>
        <div class="col-2 m-auto" style="text-align:center">
            <p style="font-size:15px;margin-bottom:0;position:relative;width:130%;left:-15%">${distance}</p>
            <hr style="margin:5px">
            <p>&nbsp;</p>
        </div>
        <div class="col-5 m-auto" style="text-align:center">
            <p style="font-size:25px;"><b>${event.destination}</b></p>
        </div>
    </div>`;
    function GenTableRow(key, val){
        return `<tr><td><b>${key}</b></td><td>${val}</td></tr>\n`;
    }
    info += "<table><tbody>";
    if(event.link != ""){
        info += GenTableRow(mltr("link"), `<a href="${event.link}" target="_blank">${event.link}</a>`);
    }
    info += GenTableRow(mltr("meetup"), getDateTime(event.meetup_timestamp * 1000));
    info += GenTableRow(mltr("departure"), getDateTime(event.departure_timestamp * 1000));
    if(userid != null && userid != -1){
        info += GenTableRow(mltr("points"), parseInt(event.points));
        info += GenTableRow(`${mltr("voters")} ${voteop}`, vote);
        info += GenTableRow(`${mltr("attendees")} ${attendeeop}`, attendee);
    }

    info += "</tbody></table>"
    info += "<div class='w-100 mt-2' style='overflow:scroll'><p>" + marked.parse(event.description).replaceAll("<img","<img style='width:100%' ") + "</p></div>";
    modalid = ShowModal(event.title, info);
    InitModal("event_detail", modalid);
}

function VoteEvent(eventid, resp) {
    $.ajax({
        url: api_host + "/" + dhabbr + "/event/vote?eventid=" + eventid,
        type: "PUT",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            ShowEventDetail(eventid, reload = true)
            toastNotification("success", "Success", resp, 5000, false);
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

function CreateEvent(){
    title = $("#event-new-title").val();
    description = simplemde["#event-new-description"].value();
    truckersmp_link = $("#event-new-truckersmp-link").val();
    departure = $("#event-new-departure").val();
    destination = $("#event-new-destination").val();
    distance = $("#event-new-distance").val();
    meetup_timestamp = +new Date($("#event-new-meetup-time").val())/1000;
    departure_timestamp = +new Date($("#event-new-departure-time").val())/1000;
    is_private = $("#event-visibility-private").is(":checked");

    LockBtn("#button-event-new-create", mltr("creating"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/event",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "title": title,
            "description": description,
            "link": truckersmp_link,
            "departure": departure,
            "destination": destination,
            "distance": distance,
            "meetup_timestamp": meetup_timestamp,
            "departure_timestamp": departure_timestamp,
            "is_private": is_private
        },
        success: function (data) {
            UnlockBtn("#button-event-new-create");
            if (data.error) return AjaxError(data);
            LoadEvent(force = true);
            toastNotification("success", "Success", mltr("event_created"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-event-new-create");
            AjaxError(data);
        }
    });
}

function EditEventShow(eventid){
    e = allevents[eventid];
    title = e.title;
    description = e.description;
    truckersmp_link = e.link;
    departure = e.departure;
    destination = e.destination;
    distance = e.distance;
    meetup_timestamp = e.meetup_timestamp;
    departure_timestamp = e.departure_timestamp;
    is_private = e.is_private;
    $("#event-edit-id-span").html(eventid);
    $("#event-edit-id").val(eventid);
    $("#event-edit-title").val(title);
    simplemde["#event-edit-description"].value(description);
    $("#event-edit-truckersmp-link").val(truckersmp_link);
    $("#event-edit-departure").val(departure);
    $("#event-edit-destination").val(destination);
    $("#event-edit-distance").val(distance);
    $("#event-edit-meetup-time").val(new Date(parseInt(meetup_timestamp)*1000).toISOString().slice(0,-1).slice(0,-1));
    $("#event-edit-departure-time").val(new Date(parseInt(departure_timestamp)*1000).toISOString().slice(0,-1).slice(0,-1));
    if(is_private) $("#event-edit-visibility-private").prop("checked", true);
    else $("#event-edit-visibility-public").prop("checked", true);
    $("#event-edit").show();
}

function EditEvent(){
    LockBtn("#button-event-edit", mltr("editing"));
    eventid = $("#event-edit-id").val();
    title = $("#event-edit-title").val();
    description = simplemde["#event-edit-description"].value();
    truckersmp_link = $("#event-edit-truckersmp-link").val();
    departure = $("#event-edit-departure").val();
    destination = $("#event-edit-destination").val();
    distance = $("#event-edit-distance").val();
    meetup_timestamp = +new Date($("#event-edit-meetup-time").val())/1000;
    departure_timestamp = +new Date($("#event-edit-departure-time").val())/1000;
    is_private = $("#event-edit-visibility-private").is(":checked");
    $.ajax({
        url: api_host + "/" + dhabbr + "/event?eventid="+eventid,
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "title": title,
            "description": description,
            "link": truckersmp_link,
            "departure": departure,
            "destination": destination,
            "distance": distance,
            "meetup_timestamp": meetup_timestamp,
            "departure_timestamp": departure_timestamp,
            "is_private": is_private
        },
        success: function (data) {
            UnlockBtn("#button-event-edit");
            if (data.error) return AjaxError(data);
            LoadEvent(force = true);
            toastNotification("success", "Success", mltr("event_edited"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-event-edit");
            AjaxError(data);
        }
    });
}

function DeleteEventShow(eventid){
    if(shiftdown) return DeleteEvent(eventid);
    title = allevents[eventid].title;
    modalid = ShowModal(mltr("delete_event"), `<p>${mltr("delete_event_note")}</p><p><i>${title}</i></p><br><p style="color:#aaa"><span style="color:lightgreen">${mltr("delete_protip")}`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("cancel")}</button><button id="button-event-delete-${eventid}" type="button" class="btn btn-danger" onclick="DeleteEvent(${eventid});">${mltr("delete")}</button>`);
    InitModal("delete_event", modalid);
}

function DeleteEvent(eventid){
    LockBtn("#button-event-delete-"+eventid, mltr("deleting"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/event?eventid=" + eventid,
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            UnlockBtn("#button-event-delete-"+eventid);
            if (data.error) AjaxError(data);
            LoadEvent(noplaceholder = true);
            toastNotification("success", "Success", mltr("event_deleted"), 5000, false);
            if(Object.keys(modals).includes("delete_event")) DestroyModal("delete_event");
        },
        error: function (data) {
            UnlockBtn("#button-event-delete-"+eventid);
            AjaxError(data);
        }
    });
}

function EditAttendeeShow(eventid){
    modalid = ShowModal(mltr("edit_event_point__attendee"), `
    <p>#${eventid} | ${allevents[eventid].title}</p>
    <label for="event-edit-point" class="form-label">${mltr("event_points")}</label>
    <div class="input-group mb-3">
        <input type="number" class="form-control bg-dark text-white" id="event-edit-point" placeholder="3000">
    </div>
    <label for="event-edit-attendee" class="form-label">${mltr("attendees")}</label>
    <div class="input-group mb-3">
        <input type='text' id="event-edit-attendee" placeholder="${mltr("select_members_from_list")}" class="form-control bg-dark text-white flexdatalist" list="all-member-datalist" data-min-length='1' multiple='' data-selection-required='1'></input>
    </div>
    <p id="event-edit-message"></p>`, 
    `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("cancel")}</button>
    <button id="button-event-edit-attendee" type="button" class="btn btn-primary" onclick="EditEventAttendee(${eventid});">${mltr("edit")}</button>`);
    InitModal("edit_event_attendee", modalid, top=true);
    $('#event-edit-attendee').flexdatalist({
        selectionRequired: 1,
        minLength: 1
    });
    attendees = allevents[eventid].attendees;
    attendeestxt = "";
    for(var i = 0 ; i < attendees.length ; i++){
        attendeestxt += `${attendees[i].name} (${attendees[i].userid}),`;
    }
    attendeestxt = attendeestxt.slice(0,-1);
    $("#event-edit-point").val(allevents[eventid].points);
    $("#event-edit-attendee").val(attendeestxt);
}

function EditEventAttendee(eventid) {
    points = $("#event-edit-point").val();
    if(!isNumber(points)){
        return toastNotification("error", "Error", mltr("invalid_event_point"), 5000);
    }
    attendeestxt = $("#event-edit-attendee").val();
    attendeest = attendeestxt.split(",");
    attendees = [];
    for(var i = 0 ; i < attendeest.length ; i++){
        s = attendeest[i];
        attendees.push(s.substr(s.lastIndexOf("(")+1,s.lastIndexOf(")")-s.lastIndexOf("(")-1));
    }
    attendees = attendees.join(",");

    LockBtn("#button-event-edit-attendee", mltr("editing"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/event/attendee?eventid=" + eventid,
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "attendees": attendees,
            "points": points
        },
        success: function (data) {
            UnlockBtn("#button-event-edit-attendee");
            if (data.error) return AjaxError(data);
            LoadEvent(noplaceholder = true);
            $("#event-edit-message").html("<br>" + marked.parse(data.response.message).replaceAll("\n","<br>"));
            toastNotification("success", "Sucess", mltr("event_point__attendee_updated"), 5000);
        },
        error: function (data) {
            UnlockBtn("#button-event-edit-attendee");
            AjaxError(data);
        }
    })
}
function DiscordSignIn(){
    window.location.href = api_host + "/" + dhabbr + "/auth/discord/redirect";
}

function SteamSignIn(){
    window.location.href = api_host + "/" + dhabbr + "/auth/steam/redirect";
}

function SteamValidate() {
    $("#auth-message-title").html("Account Connection");
    $("#auth-message-content").html("Validating steam login ...");
    ShowTab("#auth-message-tab");
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/steam",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "callback": sPageURL
        },
        success: function (data) {
            if (data.error){
                $("#auth-message-content").html("Error: Invalid login");
                return AjaxError(data);
            }
            $("#auth-message-content").html(mltr("steam_account_updated"));
            toastNotification("success", "Success", mltr("steam_account_updated"), 5000);
            setTimeout(function () {
                ShowTab("#settings-tab");
            }, 1000);
        },
        error: function (data) {
            $("#auth-message-content").html("Error: Invalid login");
            AjaxError(data);
        }
    });
}

function AuthValidate() {
    $("#auth-message-title").html("OAuth");
    $("#auth-message-content").html("Validating login ...");
    ShowTab("#auth-message-tab");

    message = getUrlParameter("message");
    if (message) {
        $("#auth-message-content").html("Error: " + message.replaceAll("+", " "));
        return toastNotification("error", "Error", message.replaceAll("+", " "), 5000);
    }

    token = getUrlParameter("token");
    mfa = getUrlParameter("mfa");

    if(mfa){
        mfafunc = OAuthMFA;
        localStorage.setItem("tipt", token);
        return ShowTab("#mfa-tab");
    }

    if (token) {
        $.ajax({
            url: api_host + "/" + dhabbr + "/token",
            type: "PATCH",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                if(data.error){
                    $("#auth-message-content").html(ParseAjaxError(data));
                    return AjaxError(data);
                }
                newtoken = data.response.token;
                localStorage.setItem("token", newtoken);
                ValidateToken();
                $(".tabs").removeClass("loaded");
                $("#auth-message-content").html(mltr("welcome_back"));
                toastNotification("success", "Success", mltr("welcome_back"), 5000);
                setTimeout(function () {
                    ShowTab("#overview-tab");
                }, 1000);
            },
            error: function (data) {
                $("#auth-message-content").html(ParseAjaxError(data));
                AjaxError(data);
            }
        });
    } else {
        ShowTab("#overview-tab", "#button-overview-tab");
    }
}

function OAuthMFA() {
    token = localStorage.getItem("tipt");
    if(token == null) return ShowTab("#overview-tab", "#button-overview-tab");

    otp = $("#mfa-otp").val();
    
    $.ajax({
        url: api_host + "/" + dhabbr + "/auth/mfa",
        type: "POST",
        dataType: "json",
        data: {
            token: token,
            otp: otp
        },
        success: function (data) {
            if(data.error){
                ShowTab("#signin-tab");
                return AjaxError(data);
            }
            token = data.response.token;
            localStorage.setItem("token", token);
            localStorage.removeItem("tipt");
            ValidateToken();
            $(".tabs").removeClass("loaded");
            $("#auth-message-content").html(mltr("welcome_back"));
            toastNotification("success", "Success", mltr("welcome_back"), 5000);
            setTimeout(function () {
                ShowTab("#overview-tab");
            }, 1000);
        },
        error: function (data) {
            ShowTab("#signin-tab");
            AjaxError(data);
        }
    });
}

function UpdateTruckersMPID() {
    LockBtn("#button-settings-update-truckersmpid", mltr("updating"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/truckersmp",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "truckersmpid": $("#settings-user-truckersmpid").val()
        },
        success: function (data) {
            UnlockBtn("#button-settings-update-truckersmpid");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", mltr("truckersmp_account_updated"), 5000);
        },
        error: function (data) {
            UnlockBtn("#button-settings-update-truckersmpid");
            return AjaxError(data);
        }
    });
}

function UpdateSteamID() {
    window.location.href = api_host + "/" + dhabbr + "/auth/steam/redirect?connect_account=true";
}

var CaptchaCallback = function (hcaptcha_response) {
    email = $("#signin-email").val();
    password = $("#signin-password").val();
    $.ajax({
        url: api_host + "/" + dhabbr + "/auth/password",
        type: "POST",
        dataType: "json",
        data: {
            email: email,
            password: password,
            "h-captcha-response": hcaptcha_response
        },
        success: function (data) {
            hcaptcha.reset();
            requireCaptcha = false;
            if (!data.error) {
                token = data.response.token;
                mfa = data.response.mfa;
                if (mfa) {
                    localStorage.setItem("tip", token);
                    localStorage.setItem("pending-mfa", +new Date());
                    ShowTab("#mfa-tab");
                } else {
                    localStorage.setItem("token", token);
                    ValidateToken();
                    $(".tabs").removeClass("loaded");
                    toastNotification("success", "Success", mltr("welcome_back"), 5000);
                    setTimeout(function () {
                        ShowTab("#overview-tab");
                    }, 1000);
                }
            } else {
                AjaxError(data);
                ShowTab("#signin-tab");
            }
        },
        error: function (data) {
            hcaptcha.reset();
            requireCaptcha = false;
            AjaxError(data);
            ShowTab("#signin-tab");
        }
    });
}

function ShowCaptcha() {
    email = $("#signin-email").val();
    password = $("#signin-password").val();
    if (email == "" || password == "") {
        return toastNotification("warning", "", mltr("enter_email_and_password"), 3000, false);
    }
    LockBtn("#button-signin", `<span class="rect-20"><i class="fa-solid fa-right-to-bracket"></i></span> Logging in`);
    requireCaptcha = true;
    setTimeout(function () {
        UnlockBtn("#button-signin");
        setTimeout(function () {
            ShowTab("#captcha-tab");
        }, 500);
    }, 1000);
}

mfato = -1;

function MFAVerify() {
    otp = $("#mfa-otp").val();
    if (!isNumber(otp) || otp.length != 6)
        return toastNotification("error", "Error", mltr("invalid_otp"), 5000);
    LockBtn("#button-mfa-verify", mltr("verifying"));
    clearInterval(mfato);
    mfato = setTimeout(function () {
        // remove otp cache after 75 seconds (2.5 rounds)
        if (!$("#mfa-tab").is(":visible")) {
            $("#mfa-otp").val("");
        }
    }, 75000);
    if (mfafunc != null) return mfafunc();
    token = localStorage.getItem("tip");
    $.ajax({
        url: api_host + "/" + dhabbr + "/auth/mfa",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            token: token,
            otp: otp
        },
        success: function (data) {
            UnlockBtn("#button-mfa-verify");
            if (data.error == true) return AjaxError(data);
            newtoken = data.response.token;
            localStorage.setItem("token", newtoken);
            localStorage.removeItem("tip");
            localStorage.removeItem("pending-mfa");
            $(".tabs").removeClass("loaded");
            ValidateToken();
            toastNotification("success", "Success", mltr("welcome_back"), 5000);
            setTimeout(function () {
                ShowTab("#overview-tab");
            }, 1000);
        },
        error: function (data) {
            UnlockBtn("#button-mfa-verify");
            AjaxError(data);
        }
    });
}
SVG_VERIFIED = `<svg style="display:inline;position:relative;top:-1.5px;color:skyblue" width="18" height="18" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M10.5213 2.62368C11.3147 1.75255 12.6853 1.75255 13.4787 2.62368L14.4989 3.74391C14.8998 4.18418 15.4761 4.42288 16.071 4.39508L17.5845 4.32435C18.7614 4.26934 19.7307 5.23857 19.6757 6.41554L19.6049 7.92905C19.5771 8.52388 19.8158 9.10016 20.2561 9.50111L21.3763 10.5213C22.2475 11.3147 22.2475 12.6853 21.3763 13.4787L20.2561 14.4989C19.8158 14.8998 19.5771 15.4761 19.6049 16.071L19.6757 17.5845C19.7307 18.7614 18.7614 19.7307 17.5845 19.6757L16.071 19.6049C15.4761 19.5771 14.8998 19.8158 14.4989 20.2561L13.4787 21.3763C12.6853 22.2475 11.3147 22.2475 10.5213 21.3763L9.50111 20.2561C9.10016 19.8158 8.52388 19.5771 7.92905 19.6049L6.41553 19.6757C5.23857 19.7307 4.26934 18.7614 4.32435 17.5845L4.39508 16.071C4.42288 15.4761 4.18418 14.8998 3.74391 14.4989L2.62368 13.4787C1.75255 12.6853 1.75255 11.3147 2.62368 10.5213L3.74391 9.50111C4.18418 9.10016 4.42288 8.52388 4.39508 7.92905L4.32435 6.41553C4.26934 5.23857 5.23857 4.26934 6.41554 4.32435L7.92905 4.39508C8.52388 4.42288 9.10016 4.18418 9.50111 3.74391L10.5213 2.62368Z" stroke="currentColor" stroke-width="1.5"/> <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/> </svg> `;
SVG_LOCKED = `<svg style="display:inline;position:relative;top:-1.5px;color:red" xmlns="http://www.w3.org/2000/svg" width="18" height="18" enable-background="new 0 0 24 24" viewBox="0 0 24 24"><path d="M17,9V7c0-2.8-2.2-5-5-5S7,4.2,7,7v2c-1.7,0-3,1.3-3,3v7c0,1.7,1.3,3,3,3h10c1.7,0,3-1.3,3-3v-7C20,10.3,18.7,9,17,9z M9,7c0-1.7,1.3-3,3-3s3,1.3,3,3v2H9V7z M13,17c0,0.6-0.4,1-1,1s-1-0.4-1-1v-3c0-0.6,0.4-1,1-1s1,0.4,1,1V17z" fill="red"/></svg>`;

default_text_color = "white";

userid = localStorage.getItem("userid");
token = localStorage.getItem("token");
isAdmin = false;
requireCaptcha = false;
highestrole = "Unknown Role";
highestroleid = 99999;
roles = SafeParse(localStorage.getItem("roles"));
rolelist = SafeParse(localStorage.getItem("role-list"));
rolecolor = SafeParse(localStorage.getItem("role-color"));
perms = SafeParse(localStorage.getItem("perms"));
positions = SafeParse(localStorage.getItem("positions"));
divisions = SafeParse(localStorage.getItem("divisions"));
applicationTypes = SafeParse(localStorage.getItem("application-types"));
userPerm = SafeParse(localStorage.getItem("user-perm"));
RANKING = SafeParse(localStorage.getItem("driver-ranks"));
RANKCLR = SafeParse(localStorage.getItem("driver-ranks-color"));
if (userPerm == null) userPerm = [];
isdark = parseInt(localStorage.getItem("darkmode"));
user_language = localStorage.getItem("language");
if (user_language == null) user_language = "en";
setCookie("language", user_language);
user_distance = null;
Chart.defaults.color = "white";
shiftdown = false;
mfaenabled = false;
mfafunc = null;
allmembers = {};
profile_userid = -1;
modals = {};
modalName2ID = {};

function Logout() {
    token = localStorage.getItem("token");
    $.ajax({
        url: api_host + "/" + dhabbr + "/token",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    localStorage.removeItem("token");
    $("#button-user-profile").attr("onclick", `ShowTab("#signin-tab", "#button-signin-tab");`);
    $("#button-user-profile").attr("data-bs-toggle", "");
    $("#user-profile-dropdown").hide();
    $("#sidebar-username").html(mltr("guest"));
    $("#sidebar-userid").html(mltr("login_first"));
    $("#sidebar-role").html(mltr("loner"));
    $("#sidebar-avatar").attr("src", "https://charlws.com/me.gif");
    $("#sidebar-application").hide();
    $("#sidebar-staff").hide();
    NonMemberMode();
    localStorage.removeItem("roles");
    localStorage.removeItem("name");
    localStorage.removeItem("highest-role");
    localStorage.removeItem("discordid");
    localStorage.removeItem("userid");
    ShowTab("#signin-tab", "#button-signin-tab");
}

function InitRankingDisplay() {
    if (RANKING != []) {
        rankpnt = Object.keys(RANKING);
        for (var i = 0; i < Math.ceil(rankpnt.length / 8); i++) {
            ranktable = `<table class="table-auto" style="display:inline">
            <thead>
              <tr class="text-xs text-gray-500 text-left">
                <th class="py-5 px-6 pb-3 font-medium">Rank</th>
                <th class="py-5 px-6 pb-3 font-medium">Points</th>
              </tr>
            </thead>
            <tbody>`;
            for (var j = 0; j < 8; j++) {
                if (rankpnt[i * 8 + j] == undefined) break;
                ranktable += `<tr class="text-sm">
                    <td class="py-5 px-6 font-medium">${RANKING[rankpnt[i * 8 + j]]}</td>
                    <td class="py-5 px-6 font-medium">${rankpnt[i * 8 + j]}</td>
                </tr>`;
            }
            ranktable += `</tbody></table>`;
            $("#ranktable").append(ranktable);
        }
    }
}

function InitResizeHandler() {
    setInterval(function () {
        if ($("#overview-tab").width() / 3 <= 300) {
            if ($("#overview-tab").width() / 2 <= 300) $(".statscard").css("width", "100%");
            else $(".statscard").css("width", "50%");
        } else $(".statscard").css("width", "33%");
    }, 10);
}

function InitPhoneView() {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) {
        t = $("div");
        for (i = 0; i < t.length; i++) {
            st = $(t[i]).attr("style");
            if (st == undefined) continue;
            st = st.replaceAll("padding:50px", "padding:5px");
            $(t[i]).attr("style", st);
        }
        $("#hometableftcontainer").css("width", "100%");
    }
}

function InitInputHandler() {
    $('#application-type').on('change', function () {
        var value = $(this).val();
        $(".application-tab").hide();
        $("#Application" + value).show();
        $("#submitAppBttn").show();
    });
    $('#application4Answer1').on('change', function () {
        var value = $(this).val();
        $(".divisiontabs").hide();
        $("#division-tab" + value).show();
    });
    $("#input-member-search").on("keydown", function (e) {
        if (e.which == 13) {
            LoadMemberList(noplaceholder = true);
        }
    });
    $("#input-user-search").on("keydown", function (e) {
        if (e.which == 13) {
            LoadUserList(noplaceholder = true);
        }
    });
    $("#signin-email").keypress(function (e) {
        if (e.which == 13) {
            if ($("#signin-password").val() == "") {
                $("#signin-password").focus();
            } else {
                ShowCaptcha();
            }
        }
    });
    $("#signin-password").keypress(function (e) {
        if (e.which == 13) {
            ShowCaptcha();
        }
    });
}

function InitDistanceUnit() {
    distance_unit = localStorage.getItem("distance-unit");
    if (distance_unit == "imperial") {
        $(".distance_unit").html("mi");
        distance_unit_txt = "mi";
        fuel_unit_txt = "gal";
        weight_unit_txt = "lb";
        distance_ratio = 0.621371;
        fuel_ratio = 0.2641720524;
        weight_ratio = 2.2046226218488;
        $("#imperialbtn").css("background-color", "none");
        $("#metricbtn").css("background-color", "#293039");
        $("#settings-distance-unit-metric").removeClass("active");
        $("#settings-distance-unit-imperial").addClass("active");
    } else {
        $(".distance_unit").html("km");
        distance_unit = "metric";
        distance_unit_txt = "km";
        fuel_unit_txt = "l";
        weight_unit_txt = "kg";
        distance_ratio = 1;
        fuel_ratio = 1;
        weight_ratio = 1;
        $("#metricbtn").css("background-color", "none");
        $("#imperialbtn").css("background-color", "#293039");
        $("#settings-distance-unit-imperial").removeClass("active");
        $("#settings-distance-unit-metric").addClass("active");
    }
}

function InitLeaderboardTimeRange() {
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    offset = (+new Date().getTimezoneOffset()) * 60 * 1000;
    firstDay = new Date(+firstDay - offset);
    date = new Date(+date - offset);
    $("#lbstart").val(firstDay.toISOString().slice(0, -1).substring(0, 10));
    $("#lbend").val(date.toISOString().slice(0, -1).substring(0, 10));
}

function InitDarkMode() {
    localStorage.setItem("darkmode", "1"); // NOTE
    isdark = parseInt(localStorage.getItem("darkmode"));
    if (localStorage.getItem("darkmode") == undefined) isdark = 1;
    if (localStorage.getItem("darkmode") == "1") {
        $("body").css("background-color", "#2F3136");
        $("body").css("color", "white");
        $("head").append(`<style id='convertbg'>
            h1,h2,h3,p,span,text,label,input,textarea,select,tr,strong {color: white;}
            .text-gray-500,.text-gray-600 {color: #ddd;}
            .bg-white {background-color: rgba(255, 255, 255, 0.1);}
            .swal2-popup {background-color: rgb(41 48 57)}
            .rounded-full {background-color: #888}
            th > .fc-scrollgrid-sync-inner {background-color: #444}
            a:hover {color: white}
            .flexdatalist-results {background-color:#57595D};
            a {color: #ccc}</style>`);
        $("#darkmode-svg").html(`<i class="fa-solid fa-sun"></i>`);
    } else {
        $("head").append(`<style>.rounded-full {background-color: #ddd}</style>`);
    }
}

function ToggleDarkMode() {
    isdark = 0; // NOTE
    if (!isdark) {
        $("body").css("background-color", "#2F3136");
        $("body").css("color", "white");
        $("head").append(`<style id='convertbg'>
            h1,h2,h3,p,span,text,label,input,textarea,select,tr {color: white;}
            svg{}
            .text-gray-500,.text-gray-600 {color: #ddd;}
            .bg-white {background-color: rgba(255, 255, 255, 0.2);}
            .swal2-popup {background-color: rgb(41 48 57)}
            .rounded-full {background-color: #888;}
            a:hover {color: white}
            .flexdatalist-results {background-color:#57595D};
            a: {color: #444}</style>`);
        Chart.defaults.color = "white";
        $("#darkmode-svg").html(`<i class="fa-solid fa-sun"></i>`);
    } else {
        $("body").css("background-color", "white");
        $("body").css("color", "");
        $("head").append(`<style id='convertbg2'>
            h1,h2,h3,p,span,text,label,input,textarea,select,tr {}
            svg{}
            .text-gray-500,.text-gray-600 {}
            .bg-white {background-color: white;}
            .swal2-popup {background-color: white;}
            .rounded-full {background-color: #ddd;}
            a:hover {color: black}
            .flexdatalist-results {background-color:white};
            a {color: #ccc}</style>`);
        $("#darkmode-svg").html(`<i class="fa-solid fa-moon"></i>`);
        $("#convertbg2").remove();
        $("#convertbg").remove();
        Chart.defaults.color = "black";
        $("body").html($("body").html().replaceAll("skyblue", "#382CDD").replaceAll("lightgreen", "green"));
    }
    isdark = 1 - isdark;
    localStorage.setItem("darkmode", isdark);
    LoadStats();
}

function InitSearchByName() {
    $.ajax({
        url: api_host + "/" + dhabbr + "/member/list/all",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return;
            l = data.response.list;
            for (var i = 0; i < l.length; i++) {
                allmembers[l[i].userid] = l[i].name;
                $("#all-member-datalist").append(`<option value="${l[i].name} (${l[i].userid})">${l[i].name} (${l[i].userid})</option>`);
            }
            $(".search-name").flexdatalist({
                selectionRequired: true,
                minLength: 1
            });
            $(".search-name-mul").flexdatalist({
                selectionRequired: 1,
                minLength: 1
            });
        }
    });
}

eventsCalendar = undefined;
curtab = "#overview-tab";
loadworking = false;
async function GeneralLoad() {
    if (loadworking) return;
    loadworking = true;
    if (isdark) $("#loading").css("border", "solid lightgreen 1px");
    else $("#loading").css("border", "solid green 1px");
    $("#loading").css("width", "50%");
    $("#loading").css("transition", "width: 0.1s");
    maxajax = 0;
    lastw = 0;
    while ($.active > 0) {
        maxajax = Math.max($.active + 1, maxajax);
        neww = parseInt(100 - $.active / maxajax * 100);
        $("#loading").css("width", `${neww}%`);
        await sleep(50);
    }
    neww = 100;
    $("#loading").css("width", `${neww}%`);
    neww = 1;
    $("#loading").css("width", `${neww}%`);
    $("#loading").css("border", "solid transparent 1px");
    loadworking = false;
}

async function ShowTab(tabname, btnname) {
    $(".modal").fadeOut();
    $(".modal-backdrop").fadeOut();
    setTimeout(function(){$(".modal").remove();$(".modal-backdrop").remove();},1000);
    loadworking = true;
    // $("html, body").animate({
    //     scrollTop: 0
    // }, "slow");
    curtab = tabname;
    clearInterval(dmapint);
    dmapint = -1;
    $("#map,#dmap,#pmap,#amap").children().remove();
    $(".tabs").hide();
    $(tabname).show();
    if (tabname == "#user-delivery-tab") {
        $("#delivery-tab").show();
    }
    loaded = $(tabname).hasClass("loaded");
    $(tabname).addClass("loaded");
    $(".nav-link").removeClass("active");
    if (btnname != "#ProfileTabBtn") {
        $(btnname).addClass("active");
    }
    if (tabname == "#map-tab") {
        window.history.pushState("", "", '/map');
        window.autofocus["map"] = -2;
        window.autofocus["amap"] = -2;
        window.autofocus["pmap"] = -2;
        LoadETS2Map();
        LoadETS2PMap();
        LoadATSMap();
    }
    if (tabname == "#ProfileTab") {
        if (isNumber(btnname)) userid = btnname;
        else userid = localStorage.getItem("userid");
        if(String(userid) == localStorage.getItem("userid")) window.history.pushState("", "", '/member/@me');
        else window.history.pushState("", "", '/member/' + userid);
        $("#UserBanner").show();
        $("#UserBanner").attr("src", "https://" + window.location.hostname + "/banner/" + userid);
        $("#UserBanner").attr("onclick", `CopyBannerURL("${userid}");`)
        $("#UserBanner").attr("oncontextmenu", `CopyBannerURL("${userid}");`)
        LoadUserProfile(userid);
    }
    if (tabname == "#notification-tab") {
        window.history.pushState("", "", '/notification');
        LoadNotificationList(noplaceholder = loaded);
    }
    if (tabname == "#overview-tab") {
        window.history.pushState("", "", '/');
        LoadStats(noplaceholder = loaded);
    }
    if (tabname == "#signin-tab") {
        if (localStorage.getItem("token") != null && localStorage.getItem("token").length == 36) {
            ShowTab("#overview-tab", "#button-overview-tab");
            return;
        }
        $("#button-user-profile").attr("onclick", `ShowTab("#signin-tab", "#button-signin-tab");`);
        window.history.pushState("", "", '/login');
    }
    if (tabname == "#captcha-tab") {
        if (!requireCaptcha) {
            ShowTab("#overview-tab", "#button-overview-tab");
            return;
        }
        $("#button-user-profile").attr("onclick", `ShowTab("#captcha-tab", "#button-captcha-tab");`);
        window.history.pushState("", "", '/captcha');
    }
    if (tabname == "#mfa-tab") {
        $("#mfa-otp").val("");
        $("#mfa-otp").removeAttr("disabled");
        clearTimeout(mfato);
        UnlockBtn("#button-mfa-verify");
        pmfa = localStorage.getItem("pending-mfa");
        if (mfafunc != null) pmfa = +new Date();
        if (pmfa == null || (+new Date() - parseInt(pmfa)) > 600000) {
            ShowTab("#overview-tab", "#button-overview-tab");
            return;
        }
        window.history.pushState("", "", '/mfa');
    }
    if (tabname == "#announcement-tab") {
        window.history.pushState("", "", '/announcement');
        LoadAnnouncement(noplaceholder = loaded);
    }
    if (tabname == "#downloads-tab") {
        window.history.pushState("", "", '/downloads');
        LoadDownloads(noplaceholder = loaded);
    }
    if (tabname == "#delivery-tab") {
        window.history.pushState("", "", '/delivery');
        $("#delivery-log-userid").val("");
        $("#company-statistics").show();
        $("#button-delivery-export").show();
        $("#user-statistics").hide();
        if (!loaded) {
            LoadDriverLeaderStatistics();
            LoadStats(true);
        }
        $("#delivery-tab").removeClass("last-load-user");
        if (!$("#delivery-tab").hasClass("last-load-company")) {
            LoadDeliveryList();
        } else {
            LoadDeliveryList(noplaceholder = loaded);
        }
        $("#delivery-tab").addClass("last-load-company");
    }
    if (tabname == "#user-delivery-tab") {
        userid = btnname;
        profile_userid = userid;
        if(String(userid) == localStorage.getItem("userid")) window.history.pushState("", "", '/member/@me');
        else window.history.pushState("", "", '/member/' + userid);
        $("#company-statistics").hide();
        $("#button-delivery-export").hide();
        $("#user-statistics").show();
        $("#delivery-tab").removeClass("last-load-company");
        if (!$("#delivery-tab").hasClass("last-load-user") || $("#delivery-tab").attr("last-load-userid") != userid) {
            LoadDeliveryList();
            LoadChart(userid);
        } else {
            LoadDeliveryList(noplaceholder = loaded);
        }
        $("#delivery-tab").addClass("last-load-user");
        $("#delivery-tab").attr("last-load-userid", userid);
    }
    if (tabname == "#challenge-tab") {
        window.history.pushState("", "", '/challenge');
        LoadChallenge(noplaceholder = loaded);
    }
    if (tabname == "#division-tab") {
        window.history.pushState("", "", '/division');
        LoadDivisionInfo(noplaceholder = loaded);
    }
    if (tabname == "#event-tab") {
        window.history.pushState("", "", '/event');
        LoadEvent(noplaceholder = loaded);
    }
    if (tabname == "#member-tab") {
        window.history.pushState("", "", '/member');
        if (!loaded) {
            LoadXOfTheMonth();
        }
        LoadMemberList(noplaceholder = loaded);
    }
    if (tabname == "#leaderboard-tab") {
        window.history.pushState("", "", '/leaderboard');
        LoadLeaderboard(noplaceholder = loaded);
    }
    if (tabname == "#ranking-tab") {
        window.history.pushState("", "", '/ranking');
        if (!loaded) LoadRanking();
    }
    if (tabname == "#submit-application-tab") {
        window.history.pushState("", "", '/application/submit');
    }
    if (tabname == "#my-application-tab") {
        window.history.pushState("", "", '/application/my');
        LoadUserApplicationList(noplaceholder = loaded);
    }
    if (tabname == "#all-application-tab") {
        window.history.pushState("", "", '/application/all');
        LoadAllApplicationList(noplaceholder = loaded);
    }
    if (tabname == "#manage-user-tab") {
        window.history.pushState("", "", '/manage/user');
        LoadUserList(noplaceholder = loaded);
    }
    if (tabname == "#audit-tab") {
        window.history.pushState("", "", '/audit');
        LoadAuditLog(noplaceholder = loaded);
    }
    if (tabname == "#config-tab") {
        window.history.pushState("", "", '/config');
        LoadConfiguration();
        $("#config-subtab").children().removeClass("active");
        $("#config-subtab").children().removeClass("show");
        $("#config-api-tab").click();
        if(!loaded){
            setInterval(function(){
                if($("#config-api-tab").hasClass("active") && $($("#config-api-control").parent()).attr("id") == "config-api-json"){
                    $("#config-api-control").appendTo("#config-api");
                } else if($("#config-api-json-tab").hasClass("active") && $($("#config-api-control").parent()).attr("id") == "config-api"){
                    $("#config-api-control").appendTo("#config-api-json");
                }
            })
        }
    }
    if (tabname == "#user-settings-tab") {
        window.history.pushState("", "", '/settings');
        LoadNotificationSettings();
        LoadUserSessions();
        if(!loaded){
            $("#notifications-drivershub").on("change", function(){
                if($("#notifications-drivershub").prop("checked")){
                    EnableNotification("drivershub", mltr("drivers_hub"));
                } else {
                    DisableNotification("drivershub", mltr("drivers_hub"));
                }
            });
            $("#notifications-discord").on("change", function(){
                if($("#notifications-discord").prop("checked")){
                    EnableNotification("discord", mltr("discord"));
                } else {
                    DisableNotification("discord", mltr("discord"));
                }
            });
            $("#notifications-login").on("change", function(){
                if($("#notifications-login").prop("checked")){
                    EnableNotification("login", mltr("login"));
                } else {
                    DisableNotification("login", mltr("login"));
                }
            });
            $("#notifications-dlog").on("change", function(){
                if($("#notifications-dlog").prop("checked")){
                    EnableNotification("dlog", mltr("delivery_log"));
                } else {
                    DisableNotification("dlog", mltr("delivery_log"));
                }
            });
            $("#notifications-member").on("change", function(){
                if($("#notifications-member").prop("checked")){
                    EnableNotification("member", mltr("member"));
                } else {
                    DisableNotification("member", mltr("member"));
                }
            });
            $("#notifications-application").on("change", function(){
                if($("#notifications-application").prop("checked")){
                    EnableNotification("application", mltr("application"));
                } else {
                    DisableNotification("application", mltr("application"));
                }
            });
            $("#notifications-challenge").on("change", function(){
                if($("#notifications-challenge").prop("checked")){
                    EnableNotification("challenge", mltr("challenge"));
                } else {
                    DisableNotification("challenge", mltr("challenge"));
                }
            });
            $("#notifications-division").on("change", function(){
                if($("#notifications-division").prop("checked")){
                    EnableNotification("division", mltr("division"));
                } else {
                    DisableNotification("division", mltr("division"));
                }
            });
            $("#notifications-event").on("change", function(){
                if($("#notifications-event").prop("checked")){
                    EnableNotification("event", mltr("event"));
                } else {
                    DisableNotification("event", mltr("event"));
                }
            });
        }
        $("#settings-subtab").children().removeClass("active");
        $("#settings-subtab").children().removeClass("show");
        if (btnname != "from-mfa") {
            $("#settings-general-tab").click();
        } else {
            $("#settings-security-tab").click();
        }
    }
}

function UpdateRolesOnDisplay() {
    rolestxt = [];
    for (i = 0; i < roles.length; i++) {
        rolestxt.push(rolelist[roles[i]]);
    }
    hrole = rolestxt[0];
    localStorage.setItem("highest-role", hrole);

    if (hrole == undefined || hrole == "undefined") hrole = mltr("loner");
    $("#sidebar-role").html(hrole);
    roleids = Object.keys(rolelist);
    for (var i = 0; i < roleids.length; i++) {
        roleids[i] = parseInt(roleids[i]);
    }
    userPerm = GetUserPermission();
    ShowStaffTabs();
}

function LoadCache(force) {
    if(force) localStorage.removeItem("cache-expire");
    rolelist = SafeParse(localStorage.getItem("role-list"));
    perms = SafeParse(localStorage.getItem("perms"));
    positions = SafeParse(localStorage.getItem("positions"));
    applicationTypes = SafeParse(localStorage.getItem("application-types"));
    divisions = SafeParse(localStorage.getItem("divisions"));
    RANKING = SafeParse(localStorage.getItem("driver-ranks"));
    RANKCLR = SafeParse(localStorage.getItem("driver-ranks-color"));

    if (positions != undefined && positions != null) {
        positionstxt = "";
        for (var i = 0; i < positions.length; i++) {
            positionstxt += positions[i] + "\n";
            $("#sa-select").append("<option value='" + positions[i].replaceAll("'", "\\'") + "'>" + positions[i] + "</option>");
        }
        positionstxt = positionstxt.slice(0, -1);
    } else {
        positions = [];
    }

    cacheExpire = parseInt(localStorage.getItem("cache-expire"));
    if (!(rolelist != undefined && perms.admin != undefined && positions != undefined && applicationTypes != undefined && divisions != undefined && RANKING != undefined && RANKCLR != undefined))
        cacheExpire = 0;
    if (!isNumber(cacheExpire)) cacheExpire = 0;
    if (cacheExpire <= +new Date()) {
        $.ajax({
            url: api_host + "/" + dhabbr + "/application/positions",
            type: "GET",
            dataType: "json",
            success: function (data) {
                positions = data.response;
                localStorage.setItem("positions", JSON.stringify(positions));
            }
        });
        $.ajax({
            url: api_host + "/" + dhabbr + "/member/roles",
            type: "GET",
            dataType: "json",
            success: function (data) {
                roles = data.response;
                rolelist = {};
                rolecolor = {};
                for (var i = 0; i < roles.length; i++) {
                    rolelist[roles[i].id] = roles[i].name;
                    rolecolor[roles[i].id] = roles[i].color;
                }
                localStorage.setItem("role-list", JSON.stringify(rolelist));
                localStorage.setItem("role-color", JSON.stringify(rolecolor));
            }
        });
        $.ajax({
            url: api_host + "/" + dhabbr + "/application/types",
            type: "GET",
            dataType: "json",
            success: function (data) {
                d = data.response;
                applicationTypes = {};
                for (var i = 0; i < d.length; i++)
                    applicationTypes[parseInt(d[i].applicationid)] = d[i].name;
                localStorage.setItem("application-types", JSON.stringify(applicationTypes));
            }
        });
        $.ajax({
            url: api_host + "/" + dhabbr + "/member/perms",
            type: "GET",
            dataType: "json",
            success: function (data) {
                perms = data.response;
                localStorage.setItem("perms", JSON.stringify(perms));
            }
        });
        $.ajax({
            url: api_host + "/" + dhabbr + "/member/ranks",
            type: "GET",
            dataType: "json",
            success: function (data) {
                d = data.response;
                RANKING = {};
                RANKCLR = {};
                for (i = 0; i < d.length; i++) {
                    RANKING[parseInt(d[i]["points"])] = d[i]["name"];
                    RANKCLR[parseInt(d[i]["points"])] = d[i]["color"];
                    if(RANKCLR[parseInt(d[i]["points"])] == undefined) RANKCLR[parseInt(d[i]["points"])] = default_text_color;
                }
                localStorage.setItem("driver-ranks", JSON.stringify(RANKING));
                localStorage.setItem("driver-ranks-color", JSON.stringify(RANKCLR));
            }
        });
        $.ajax({
            url: api_host + "/" + dhabbr + "/division/list",
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                d = data.response;
                divisions = {};
                for (i = 0; i < d.length; i++) {
                    divisions[d[i].id] = d[i];
                }
                localStorage.setItem("divisions", JSON.stringify(divisions));
            },
            error: function (data) {
                divisions = {}; // no division plugin
                localStorage.setItem("divisions", JSON.stringify(divisions));
            }
        });
        localStorage.setItem("cache-expire", +new Date() + 86400000);
    }
}

function ClearCache(){
    localStorage.removeItem("cache-expire");
    toastNotification("success","Success","Local cache cleared!",5000);
    setTimeout(function(){window.location.reload();},500);
}

userPermLoaded = false;

function GetUserPermission() {
    if (roles == undefined || perms.admin == undefined) return;
    userPerm = [];
    for (i = 0; i < roles.length; i++) {
        for (j = 0; j < Object.keys(perms).length; j++) {
            for (k = 0; k < perms[Object.keys(perms)[j]].length; k++) {
                if (perms[Object.keys(perms)[j]][k] == roles[i]) {
                    userPerm.push(Object.keys(perms)[j]);
                }
            }
        }
    }
    userPerm.push("user");
    userPermLoaded = true;
    localStorage.setItem("user-perm", JSON.stringify(userPerm));
    return userPerm;
}

function ShowStaffTabs() {
    t = SafeParse(JSON.stringify(userPerm));
    if (t == null) return;
    if(t.indexOf('user') != -1) t.splice(t.indexOf('user'),1);
    if(t.indexOf('driver') != -1) t.splice(t.indexOf('driver'),1);
    if (t.length > 0) {
        if (userPerm.includes("admin")) {
            $("#sidebar-staff").show();
            $("#button-all-application-tab").show();
            $("#button-manage-user").show();
            $("#button-audit-tab").show();
            $("#button-config-tab").show();
        } else {
            if (userPerm.includes("hr") || userPerm.includes("division")) {
                $("#sidebar-staff").show();
                $("#button-all-application-tab").show();
            }
            if (userPerm.includes("hr")) {
                $("#sidebar-staff").show();
                $("#button-manage-user").show();
            }
            if (userPerm.includes("audit")) {
                $("#sidebar-staff").show();
                $("#button-audit-tab").show();
            }
        }
    }
}

function NonMemberMode() {
    $("#sidebar-role").html(mltr("loner"));
    $("#overview-right-col").hide();
    $("#overview-left-col").removeClass("col-8");
    $("#overview-left-col").addClass("col");
    $(".member-only").hide();
    $(".non-member-only").show();
    $("#sidebar-staff").hide();
}

function MemberMode() {
    $("#overview-right-col").show();
    $("#overview-left-col").addClass("col-8");
    $("#overview-left-col").removeClass("col");
    $(".member-only").show();
    $(".non-member-only").hide();
}

function PreValidateToken() {
    userid = localStorage.getItem("userid");
    name = localStorage.getItem("name");
    discordid = localStorage.getItem("discordid");
    avatar = localStorage.getItem("avatar");
    highestrole = localStorage.getItem("highest-role");
    highestroleid = localStorage.getItem("highest-role-id");

    if (userid == null || name == null) {
        $("#sidebar-username").html(`<span class="placeholder col-8"></span>`);
        $("#sidebar-userid").html(`<span class="placeholder col-2"></span>`);
        $("#sidebar-role").html(`<span class="placeholder col-6"></span>`);
        return;
    }
    $("#sidebar-username").html(name);
    $("#sidebar-userid").html("#" + userid);
    $("#sidebar-banner").attr("src", api_host + "/" + dhabbr + "/member/banner?userid=" + userid);
    if (avatar.startsWith("a_"))
        $("#sidebar-avatar").attr("src", "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif");
    else
        $("#sidebar-avatar").attr("src", "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png");
    $("#sidebar-role").html(highestrole);

    ShowStaffTabs();
}

function ValidateToken() {
    token = localStorage.getItem("token");
    userid = localStorage.getItem("userid");
    if (token == null) { // token does not exist
        localStorage.setItem("token", "guest");
        token = "guest";
    }

    if (token == "guest") {
        // Guest, not logged in, update elements
        $("#sidebar-application").hide();
        $("#sidebar-username").html(mltr("guest"));
        $("#sidebar-userid").html(mltr("login_first"));
        $("#button-user-profile").attr("onclick", `ShowTab("#signin-tab", "#button-signin-tab");`);
        $("#button-user-profile").attr("data-bs-toggle", "");
        $("#user-profile-dropdown").hide();
        $("#button-user-delivery-tab").attr("onclick", `ShowTab("#signin-tab", "#button-signin-tab");`);
        $("#button-user-settings-tab").attr("onclick", `ShowTab("#signin-tab", "#button-signin-tab");`);
        NonMemberMode();
        userPermLoaded = true;
        localStorage.removeItem("roles");
        localStorage.removeItem("name");
        localStorage.removeItem("highest-role");
        localStorage.removeItem("discordid");
        localStorage.removeItem("userid");
        return;
    }

    $("#sidebar-application").show();
    $("#button-user-profile").attr("onclick", ``);
    $("#button-user-profile").attr("data-bs-toggle", "dropdown");
    $("#user-profile-dropdown").css("display","");
    $("#button-user-delivery-tab").attr("onclick", `LoadUserProfile(localStorage.getItem('userid'));`);
    $("#button-user-settings-tab").attr("onclick", `ShowTab('#user-settings-tab');`);

    if (userid != -1 && userid != null) {
        MemberMode();
        $("#sidebar-banner").show();
    } else {
        NonMemberMode();
    }

    // Validate token and get user information
    $.ajax({
        url: api_host + "/" + dhabbr + "/user",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            if (data.error) {
                // Invalid token, log out
                localStorage.removeItem("token");
                ShowTab("#signin-tab", "#button-signin-tab");
                return;
            }

            $("#button-user-profile").attr("data-bs-toggle", "dropdown");
            $("#user-profile-dropdown").css("display","");

            // X Drivers Trucking Info
            color = "green";
            if (isdark) color = "lightgreen";
            $("#header").prepend(`<p style="color:${color}"><svg style="color:${color};display:inline" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
            fill="currentColor" class="bi bi-activity" viewBox="0 0 16 16">
            <path fill-rule="evenodd"
                d="M6 2a.5.5 0 0 1 .47.33L10 12.036l1.53-4.208A.5.5 0 0 1 12 7.5h3.5a.5.5 0 0 1 0 1h-3.15l-1.88 5.17a.5.5 0 0 1-.94 0L6 3.964 4.47 8.171A.5.5 0 0 1 4 8.5H.5a.5.5 0 0 1 0-1h3.15l1.88-5.17A.5.5 0 0 1 6 2Z"
                fill="${color}"></path>
            </svg>&nbsp;&nbsp;<span id="topbar-message" style="color:${color}"></span><span style="color:orange"></p>`);

            // User Information
            user = data.response.user;
            localStorage.setItem("roles", JSON.stringify(user.roles));
            localStorage.setItem("name", user.name.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, ''));
            localStorage.setItem("avatar", user.avatar);
            localStorage.setItem("discordid", user.discordid);
            localStorage.setItem("userid", user.userid);

            userid = user.userid;

            if (userid != -1 && userid != null) {
                // Logged in, and is member, show membersOnlyTabs
                MemberMode();
                $("#sidebar-banner").show();
            } else {
                // Logged in, not member, hide division and downloads
                NonMemberMode();
            }

            // Check if is member
            userid = user.userid;
            if (user.userid != -1) {
                $("#button-member-tab").show();
            }
            roles = user.roles.sort(function (a, b) {
                return a - b
            });
            highestrole = rolelist[roles[0]];
            if(highestrole == undefined) highestrole = "Unknown Role";
            highestroleid = roles[0];
            localStorage.setItem("highest-role", highestrole);
            localStorage.setItem("highest-role-id", highestroleid);
            
            name = user.name.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
            avatar = user.avatar;
            discordid = user.discordid;
            $("#sidebar-username").html(name);
            $("#sidebar-userid").html("#" + userid);
            $("#sidebar-bio").html(user.bio);
            simplemde["#settings-bio"].value(user.bio);
            $("#sidebar-banner").attr("src", api_host + "/" + dhabbr + "/member/banner?userid=" + userid);
            if (avatar.startsWith("a_"))
                $("#sidebar-avatar").attr("src", "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif");
            else
                $("#sidebar-avatar").attr("src", "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png");

            mfaenabled = user.mfa;
            if (mfaenabled) {
                $("#button-settings-mfa-disable").show();
            } else {
                $("#button-settings-mfa-enable").show();
            }

            $("#settings-user-truckersmpid").val(user.truckersmpid);
            $("#settings-user-steamid").val(user.steamid);

            UpdateRolesOnDisplay();
            LoadNotification();
            setInterval(function () {
                LoadNotification();
            }, 30000);

            if (!userPerm.includes("driver") && !userPerm.includes("admin")) {
                $("#sidebar-userid").html("##");
                NonMemberMode();
            }

            $.ajax({
                url: api_host + "/" + dhabbr + "/dlog/leaderboard?point_types=distance,challenge,event,division,myth&userids=" + String(userid),
                type: "GET",
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                success: async function (data) {
                    if (!data.error && data.response.list.length == 1) {
                        user_distance = data.response.list[0].points.distance;
                    } else {
                        user_distance = 0;
                    }
                }
            });

            $.ajax({
                url: api_host + "/" + dhabbr + "/user/language",
                type: "GET",
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                success: async function (data) {
                    user_language = data.response.language;
                    $("#api-language-" + user_language).prop("selected", true);
                    localStorage.setItem("language", user_language);
                    if(getCookie("language") && getCookie("language") != user_language){
                        setCookie("language", user_language);
                        window.location.reload();
                    }
                    setCookie("language", user_language);
                }
            });
        },
        error: function (data) {
            // Invalid token, log out
            if (parseInt(data.status) == 401) { // Prevent connection issue (e.g. refresh)
                localStorage.removeItem("token");
                ShowTab("#signin-tab", "#button-signin-tab");
            }
        }
    });
}

function InitLanguage(){
    $.ajax({
        url: api_host + "/" + dhabbr + "/languages",
        type: "GET",
        dataType: "json",
        success: function (data) {
            languages = data.response.supported;
            for(var i = 0 ; i < languages.length ; i++){
                $("#api-language").append(`<option id="api-language-${languages[i]}" value="${languages[i]}">${LANG_CODE[languages[i]]}</option>`);
            }
            $("#api-language-" + user_language).prop("selected", true);
            $("#api-language").on('change', function () {
                user_language = $(this).val();
                $.ajax({
                    url: api_host + "/" + dhabbr + "/user/language",
                    type: "PATCH",
                    dataType: "json",
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },
                    data: {
                        language: user_language
                    },
                    success: function (data) {
                        if(data.error) return AjaxError(data);
                        setCookie("language", user_language);
                        localStorage.setItem("language", user_language);
                        toastNotification("success", "Success", "Language Updated to: " + LANG_CODE[user_language], 5000);
                        setTimeout(function(){window.location.reload();}, 500);
                    },
                    error: function(data){
                        AjaxError(data);
                    }
                });
            });
        }
    });
}

async function PathDetect() {
    await sleep(100);
    p = window.location.pathname;
    if (p == "/overview") window.history.pushState("", "", '/');
    else if (p == "/") ShowTab("#overview-tab", "#button-overview-tab");
    else if (p == "/notification") ShowTab("#notification-tab");
    else if (p == "/login") ShowTab("#signin-tab", "#button-signin-tab");
    else if (p == "/captcha") ShowTab("#captcha-tab", "#button-captcha-tab");
    else if (p == "/mfa") ShowTab("#mfa-tab", "#button-mfa-tab");
    else if (p == "/announcement") ShowTab("#announcement-tab", "#button-announcement-tab");
    else if (p == "/downloads") ShowTab("#downloads-tab", "#button-downloads-tab");
    else if (p == "/map") ShowTab("#map-tab", "#button-map-tab");
    else if (p.startsWith("/delivery")) {
        if (getUrlParameter("logid")) {
            logid = getUrlParameter("logid");
            $(".tabbtns").removeClass("bg-indigo-500");
            $("#button-delivery-tab").addClass("bg-indigo-500");
            ShowDeliveryDetail(logid);
            return;
        }
        if (p.split("/").length >= 3) {
            $(".tabbtns").removeClass("bg-indigo-500");
            $("#button-delivery-tab").addClass("bg-indigo-500");
            ShowDeliveryDetail(p.split("/")[2]);
        } else ShowTab("#delivery-tab", "#button-delivery-tab");
    } else if (p == "/challenge") ShowTab("#challenge-tab", "#button-challenge-tab");
    else if (p == "/division") ShowTab("#division-tab", "#button-division-tab");
    else if (p == "/event") ShowTab("#event-tab", "#button-event-tab");
    else if (p == "/staff/event") ShowTab("#staff-event-tab", "#button-staff-event-tab");
    else if (p == "/member/@me"){
        LoadUserProfile(parseInt(localStorage.getItem("userid")));
    }
    else if (p.startsWith("/member")) {
        if (getUrlParameter("userid")) {
            userid = getUrlParameter("userid");
            LoadUserProfile(userid);
            return;
        }
        if (p.split("/").length >= 3) LoadUserProfile(parseInt(p.split("/")[2]));
        else ShowTab("#member-tab", "#button-member-tab");
    }
    else if (p == "/leaderboard") ShowTab("#leaderboard-tab", "#button-leaderboard-tab");
    else if (p == "/ranking") ShowTab("#ranking-tab", "#button-ranking-tab");
    else if (p == "/application/my") ShowTab("#my-application-tab", "#button-my-application-tab");
    else if (p == "/application/all") ShowTab("#all-application-tab", "#button-all-application-tab");
    else if (p == "/application/submit" || p == "/apply") ShowTab("#submit-application-tab", "#button-submit-application-tab");
    else if (p == "/manage/user") ShowTab("#manage-user-tab", "#button-manage-user");
    else if (p == "/audit") ShowTab("#audit-tab", "#button-audit-tab");
    else if (p == "/config") ShowTab("#config-tab", "#button-config-tab");
    else if (p == "/settings") ShowTab("#user-settings-tab");
    else if (p.startsWith("/images")) {
        filename = p.split("/")[2];
        window.location.href = "https://drivershub-cdn.charlws.com/assets/" + dhabbr + "/" + filename;
    } else if (p.startsWith("/steamcallback")) {
        SteamValidate();
    } else if (p.startsWith("/auth")) {
        AuthValidate();
    } else {
        ShowTab("#overview-tab", "#button-overview-tab");
        window.history.pushState("", "", '/');
    }
}

window.onpopstate = function (event) {
    PathDetect();
};

simplebarINIT = ["#sidebar", "#table_mini_leaderboard", "#table_new_driver", "#table_online_driver", "#table_delivery_log", "#table_division_delivery", "#table_leaderboard", "#table_my_application", "#notification-dropdown-wrapper"];
simplemde = {"#settings-bio": undefined, "#announcement-new-content": undefined, "#downloads-new-description": undefined, "#downloads-edit-description": undefined, "#challenge-new-description": undefined, "#challenge-edit-description": undefined, "#event-new-description": undefined, "#event-edit-description": undefined}
tooltipINIT = ["#api-hex-color-tooltip", "#api-logo-link-tooltip", "#api-require-truckersmp-tooltip", "#api-privacy-tooltip", "#api-in-guild-check-tooltip", "#api-delivery-log-channel-id-tooltip"];
$(document).ready(async function () {
    while (1) {
        if(language != undefined) break;
        await sleep(100);
    }
    PreValidateToken();
    $("#mfa-otp").val("");
    $("textarea").val("");
    $("body").keydown(function (e) {
        if (e.which == 16) shiftdown = true;
    });
    $("body").keyup(function (e) {
        if (e.which == 16) shiftdown = false;
    });
    setTimeout(function () {
        $("#mfa-otp").on("input", function () {
            if ($("#mfa-otp").val().length == 6) {
                $("#mfa-otp").attr("disabled");
                MFAVerify();
            }
        });
    }, 50);
    $(".pageinput").val("1");
    setInterval(function () {
        $(".ol-unselectable").css("border-radius", "15px"); // map border
    }, 1000);
    $('#input-leaderboard-search').flexdatalist({
        selectionRequired: 1,
        minLength: 1,
        limitOfValues: 10
    });
    $('#input-audit-log-staff').flexdatalist({
        selectionRequired: 1,
        minLength: 1,
        limitOfValues: 1
    });
    $("#input-audit-log-staff-flexdatalist").css("border-radius", "0.375rem 0 0 0.375rem");
    $("#application-type-default").prop("selected", true);
    setTimeout(function () {
        for (i = 0; i < simplebarINIT.length; i++) new SimpleBar($(simplebarINIT[i])[0]);
    }, 500);
    for (i = 0; i < Object.keys(simplemde).length; i++) simplemde[Object.keys(simplemde)[i]] = new SimpleMDE({element:$(Object.keys(simplemde)[i])[0]});
    for(i=0;i<tooltipINIT.length;i++) new bootstrap.Tooltip($(tooltipINIT[i]), {boundary: document.body});
    $("[title='Toggle Fullscreen (F11)']").remove();
    $("[title='Toggle Side by Side (F9)']").remove();
    PathDetect();
    LoadCache();
    InitPhoneView();
    InitDistanceUnit();
    InitSearchByName();
    InitRankingDisplay();
    InitLeaderboardTimeRange();
    InitInputHandler();
    InitResizeHandler();
    InitLanguage();
    PreserveApplicationQuestion();
    while (1) {
        rolelist = SafeParse(localStorage.getItem("role-list"));
        rolecolor = SafeParse(localStorage.getItem("role-color"));
        perms = SafeParse(localStorage.getItem("perms"));
        positions = SafeParse(localStorage.getItem("positions"));
        applicationTypes = SafeParse(localStorage.getItem("application-types"));
        if (rolelist != undefined && rolecolor != null && perms != null && perms.admin != undefined && positions != undefined && applicationTypes != undefined) break;
        await sleep(100);
    }
    roleids = Object.keys(rolelist);
    for (var i = 0; i < roleids.length; i++) {
        $("#all-role-datalist").append(`<option value="${rolelist[roleids[i]]} (${roleids[i]})">${rolelist[roleids[i]]} (${roleids[i]})</option>`);;
    }
    positionstxt = "";
    for (var i = 0; i < positions.length; i++) {
        positionstxt += positions[i] + "\n";
        $("#application2Answer3").append("<option value='" + positions[i].replaceAll("'", "\\'") + "'>" + positions[i] + "</option>");
    }
    ValidateToken();
});
// Burger menus
document.addEventListener('DOMContentLoaded', function() {
    // open
    const burger = document.querySelectorAll('.navbar-burger');
    const menu = document.querySelectorAll('.navbar-menu');

    if (burger.length && menu.length) {
        for (var i = 0; i < burger.length; i++) {
            burger[i].addEventListener('click', function() {
                for (var j = 0; j < menu.length; j++) {
                    menu[j].classList.toggle('hidden');
                }
            });
        }
    }

    // close
    const close = document.querySelectorAll('.navbar-close');
    const backdrop = document.querySelectorAll('.navbar-backdrop');

    if (close.length) {
        for (var i = 0; i < close.length; i++) {
            close[i].addEventListener('click', function() {
                for (var j = 0; j < menu.length; j++) {
                    menu[j].classList.toggle('hidden');
                }
            });
        }
    }

    if (backdrop.length) {
        for (var i = 0; i < backdrop.length; i++) {
            backdrop[i].addEventListener('click', function() {
                for (var j = 0; j < menu.length; j++) {
                    menu[j].classList.toggle('hidden');
                }
            });
        }
    }
});

