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

    xhttp.onload = function () {
        var fileReader = new FileReader();
        fileReader.onloadend = function () {
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
    console.log("Drivers Hub: Frontend (v2.6.6)");
    console.log('An official client side solution of "Drivers Hub: Backend" (© CharlesWithC)');
    console.log('CHub Website: https://drivershub.charlws.com/');
    console.log('Discord: https://discord.gg/KRFsymnVKm');
    console.log("Copyright © 2023 CharlesWithC All rights reserved.");

    $.ajax({
        url: "/languages/en.json?v2.6.6",
        type: "GET",
        contentType: "application/json", processData: false,
        success: function (data) {
            enlang = data;
            if (language == "en") {
                lang = enlang;
            } else {
                $.ajax({
                    url: "/languages/" + language + ".json?v2.5.70720",
                    type: "GET",
                    contentType: "application/json", processData: false,
                    success: function (data) {
                        lang = data;
                    },
                    error: function (data) {
                        lang = enlang;
                    }
                });
            }
        }
    });

    toDataURL("https://cdn.chub.page/assets/" + dhabbr + "/logo.png?v=2.4.6&key=" + logo_key, function (dataURL) {
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
    return JSON.parse(data.responseText).error ? JSON.parse(data.responseText).error : data.status + " " + data.statusText;
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

SPECIAL_COLOR = { "project_team": "#2fc1f7", "community_manager": "#e488b9", "development_team": "#e75757", "support_manager": "#f6529a", "marketing_manager": "#ecb484", "patron": "#DAA520", "server_booster": "#DAA520" };

function GetSpecialColor(discordid) {
    if (specialRoles == undefined) return null;
    let spr = Object.keys(specialRoles);
    for (var i = 0; i < spr.length; i++) {
        if (specialRoles[spr[i]].includes(discordid)) {
            return SPECIAL_COLOR[spr[i]];
        }
    }
    return null;
}

function GetSpecialColorStyle(discordid) {
    if (GetSpecialColor(discordid) != null) return `color:${GetSpecialColor(discordid)};`;
    else return "";
}

function GetAvatarSrc(discordid, avatarid) {
    if (avatarid != null) {
        return avatarid;
    } else src = logob64;
}

function GetAvatarImg(src, userid, name) {
    style = GetSpecialColorStyle(src.split("/")[4]);
    return `<a style="cursor:pointer;${style}" onclick="LoadUserProfile(${userid})">
        <img src="${src}" style="width:20px;height:20px;border-radius:100%;display:inline" onerror="if($(this).attr('src')!=logob64) $(this).attr('src',logob64);">
        <b>${name}</b>
    </a>`;
}

function GetAvatar(userid, name, discordid, avatarid) {
    src = GetAvatarSrc(discordid, avatarid);
    style = GetSpecialColorStyle(discordid);
    return `<a style="cursor:pointer;${style}" onclick="LoadUserProfile(${userid})">
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

function FileURLOutput(filename, src) {
    var xhttp = new XMLHttpRequest();

    xhttp.onload = function () {
        var fileReader = new FileReader();
        fileReader.onloadend = function () {
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

    xhttp.onerror = function () {
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

async function toastNotification(type, title, text, time = 5000) {
    while (1) {
        try {
            Noty;
            break;
        } catch {
            await sleep(100);
        }
    }
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
    if (suffix == undefined) {
        suffix = "e" + suffixNum * 3;
    }
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

async function InitModal(name, modalid, top = false) {
    while (1) {
        try {
            bootstrap;
            break;
        } catch {
            await sleep(100);
        }
    }

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
        minutes = `0${minutes}`;
    }

    if (prefomattedDate) {
        // Today at 10:20
        // Yesterday at 10:20
        return `${prefomattedDate} at ${hours}:${minutes}`;
    }

    if (hideYear) {
        // January 10. at 10:20
        return `${month} ${OrdinalSuffix(day)} at ${hours}:${minutes}`;
    }

    // January 10. 2017. at 10:20
    return `${month} ${OrdinalSuffix(day)} ${year} at ${hours}:${minutes}`;
}


// --- Main function
function timeAgo(dateParam) {
    if (dateParam.getTime() === new Date(0).getTime()) {
        return "Never";
    }
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
        return `${seconds} ${mltr('sec_ago')}`;
    } else if (seconds < 90) {
        return mltr('about_a_min_ago');
    } else if (minutes < 60) {
        return `${minutes} ${mltr('min_ago')}`;
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

function CSVToArray(strData, strDelimiter) {
    strDelimiter = (strDelimiter || ",");
    var objPattern = new RegExp(
        (
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
    );
    var arrData = [[]];
    var arrMatches = null;
    while (arrMatches = objPattern.exec(strData)) {
        var strMatchedDelimiter = arrMatches[1];
        if (
            strMatchedDelimiter.length &&
            strMatchedDelimiter !== strDelimiter
        ) {
            arrData.push([]);
        }

        var strMatchedValue;
        if (arrMatches[2]) {
            strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"), "\"");

        } else {
            strMatchedValue = arrMatches[3];

        }
        arrData[arrData.length - 1].push(strMatchedValue);
    }

    return (arrData);
}

function sortDictByKey(dict) {
    const keys = Object.keys(dict);
    keys.sort();
    const sortedDict = [];
    for (const key of keys) {
        sortedDict.push({
            [key]: dict[key]
        });
    }
    return sortedDict;
}
