MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

$(document).ready(function () {
    drivershub = `    ____       _                         __  __      __  
   / __ \\_____(_)   _____  __________   / / / /_  __/ /_ 
  / / / / ___/ / | / / _ \\/ ___/ ___/  / /_/ / / / / __ \\
 / /_/ / /  / /| |/ /  __/ /  (__  )  / __  / /_/ / /_/ /
/_____/_/  /_/ |___/\\___/_/  /____/  /_/ /_/\\__,_/_.___/ 
                                                         `
    console.log(drivershub);
    console.log("Drivers Hub: Frontend (v2.0.0)");
    console.log("Copyright © 2022 CharlesWithC All rights reserved.");
    console.log('Compatible with "Drivers Hub: Backend" (© 2022 CharlesWithC)');
});

function AjaxError(data, no_notification = false) {
    errmsg = JSON.parse(data.responseText).descriptor ? JSON.parse(data.responseText).descriptor : data.status + " " + data.statusText;
    if (!no_notification) toastNotification("error", "Error", errmsg, 5000, false);
    console.warn(`API Request Failed: ${errmsg}\nDetails: ${data}`);
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

function GetAvatar(userid, name, discordid, avatarid) {
    src = GetAvatarSrc(discordid, avatarid);
    return `<a style="cursor:pointer" onclick="LoadUserProfile(${userid})">
        <img src="${src}" style="width:20px;border-radius:100%;display:inline" onerror="$(this).attr('src','/images/logo.png');">
        ${name}
    </a>`;
}

function CopyBannerURL(userid) {
    navigator.clipboard.writeText("https://" + window.location.hostname + "/banner/" + userid);
    return toastNotification("success", "Banner URL copied to clipboard!")
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
    if($(btnid).attr("disabled") == "disabled") return;
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

function toastNotification(type, title, text, time = 5) {
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
        if (data[i][0].startsWith("<tr_style>")) {
            s = data[i][0];
            s = s.substr(10, s.length - 21);
            $(table + "_data").append(`<tr style="${s}">`);
        } else {
            $(table + "_data").append(`<tr>`);
        }
        for (var j = 0; j < data[i].length; j++) {
            if (!data[i][j].startsWith("<tr_style>")) {
                $(table + "_data").append(`<td>${data[i][j]}</td>`);
            }
        }
        $(table + "_data").append(`</tr>`);
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

function ShowModal(title, content, footer = `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>`){
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

function InitModal(name, modalid, top = false){
    DestroyModal(name, immediately = true);
    modalName2ID[name] = modalid;
    modals[name] = new bootstrap.Modal('#modal-' + modalid);
    modals[name].show();
    $("#modal-"+modalid).on('hidden.bs.modal', function(){
        modals[name].dispose();$("#modal-"+modalid).remove();delete modals[name];
    })
    if(top){
        $("#modal-"+modalid).css("z-index", "1060");
        $($("#modal-"+modalid).nextAll(".modal-backdrop")[0]).css("z-index", "1059");
    }
}

function DestroyModal(name, immediately = false){
    if(Object.keys(modals).includes(name)){
        if(!immediately){
            modals[name].hide();
            setTimeout(function(){
                modals[name].dispose();
                $("#modal-"+modalName2ID[name]).remove();
                delete modals[name];
                delete modalName2ID[name];
            }, 1000);
        } else {
            modals[name].dispose();
            $("#modal-"+modalName2ID[name]).remove();
            delete modals[name];
            delete modalName2ID[name];
        }
    }
}
dmapint = -1;
window.mapcenter = {}
window.autofocus = {}

levent = 1;
ldivision = 1;

function LoadDriverLeaderStatistics() {   
    function AjaxLDLS(start, end, dottag){
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/dlog/leaderboard?start_time=" + start + "&end_time=" + end + "&page=1&page_size=1",
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
    for(var i = 0 ; i < driver_of_the_tag.length ; i++){
        dott = driver_of_the_tag[i];
        var start = new Date();
        if(dott == "d") start = new Date();
        else if(dott == "w") start = GetMonday(new Date()); 
        start.setHours(0, 0, 0, 0);
        start = +start + start.getTimezoneOffset() * 60000;
        start /= 1000;
        var end = +new Date() / 1000;
        start = parseInt(start);
        end = parseInt(end);
        AjaxLDLS(start, end, dott);
    }
}

function LoadLeaderboard() {
    GeneralLoad();
    LockBtn("#LoadLeaderboardBtn", btntxt = "...");
    InitPaginate("#table_leaderboard", "LoadLeaderboard();");

    page = parseInt($("#table_leaderboard_page_input").val())
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    var start_time = -1, end_time = -1;
    if ($("#lbstart").val() != "" && $("#lbend").val() != "") {
        start_time = +new Date($("#lbstart").val()) / 1000;
        end_time = +new Date($("#lbend").val()) / 1000 + 86400;
    }

    speedlimit = parseInt($("#lbspeedlimit").val());
    if (!isNumber(speedlimit)) speedlimit = 0; // make sure speedlimit is valid
    speedlimit /= distance_ratio; // convert to km/h

    game = 0;
    if (dets2 && !dats) game = 1;
    else if (!dets2 && dats) game = 2;
    else if (!dets2 && !dats) game = -1;
    $(".dgame").css("background-color", "");
    if (game == 0) $(".dgame").css("background-color", "skyblue");
    else $(".dgame" + game).css("background-color", "skyblue");
    if (!dets2 && !dats) start_time = 1, end_time = 2; // no game selected, set time to none

    if (levent) $("#levent").css("background-color", "skyblue");
    else $("#levent").css("background-color", "");
    if (ldivision) $("#ldivision").css("background-color", "skyblue");
    else $("#ldivision").css("background-color", "");
    limittype = "distance,myth,"
    if(levent == 1) limittype += "event,";
    if(ldivision == 1) limittype += "division,";

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog/leaderboard?page=" + page + "&speed_limit=" + parseInt(speedlimit) + "&start_time=" + start_time + "&end_time=" + end_time + "&game=" + game + "&point_types=" + limittype,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#LoadLeaderboardBtn");
            if (data.error) return AjaxError(data);

            leaderboard = data.response.list;
            total_pages = data.response.total_pages;
            data = [];
            for (i = 0; i < leaderboard.length; i++){
                user = leaderboard[i];
                distance = TSeparator(parseInt(user.points.distance * distance_ratio)); 
                data.push([`#${user.points.rank} ${GetAvatar(user.user.userid, user.user.name, user.user.discordid, user.user.avatar)}`, `${point2rank(parseInt(user.points.total_no_limit))} (#${user.points.rank_no_limit})`, `${distance}`, `${user.points.event}`, `${user.points.division}`, `${user.points.myth}`, `${user.points.total}`]);
            }
            PushTable("#table_leaderboard", data, total_pages, "LoadLeaderboard();");
        },
        error: function (data) {
            UnlockBtn("#LoadLeaderboardBtn");
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

function LoadDeliveryList() {
    GeneralLoad();
    LockBtn("#button-delivery-log-options-update", btntxt = "...");
    InitPaginate("#table_delivery_log", "LoadDeliveryList();");

    $("#table_delivery_log_data").children().remove();
    for(i = 0 ; i < 10 ; i++){
        $("#table_delivery_log_data").append(dlog_placeholder_row);
    }

    page = parseInt($("#table_delivery_log_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;
    
    var start_time = -1, end_time = -1;
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

    status = 0;
    delivered = $("#delivery-log-delivered").is(":checked");
    cancelled = $("#delivery-log-cancelled").is(":checked");
    if(delivered && !cancelled) status = 1;
    else if(!delivered && cancelled) status = 2;

    if (!dets2 && !dats) start_time = 1, end_time = 2;

    page_size = parseInt($("#delivery-log-page-size").val());
    if (!isNumber(page_size)) page_size = 10;

    uid = parseInt($("#delivery-log-userid").val());
    if(!isNumber(uid) || uid < 0){
        uid = "";
    } else {
        uid = "&userid=" + uid;
    }

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog/list?page=" + page + "&speed_limit=" + parseInt(speedlimit) + "&start_time=" + start_time + "&end_time=" + end_time + "&game=" + game + "&page_size=" + page_size + "&status=" + status + uid,
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
                if (delivery.division_validated == true) dextra = "<span title='Validated Division Delivery'>" + SVG_VERIFIED + "</span>";
                
                dloguser = GetAvatar(user.userid, user.name, user.discordid, user.avatar);
                if($("#delivery-log-userid").val() == localStorage.getItem("userid")) dloguser = "Me";
                data.push([`<tr_style>color:${color}</tr_style>`, `<a style='cursor:pointer' onclick="ShowDeliveryDetail('${delivery.logid}')">${delivery.logid} ${dextra}</a>`, `${dloguser}`, `${delivery.source_company}, ${delivery.source_city}`, `${delivery.destination_company}, ${delivery.destination_city}`, `${distance}${distance_unit_txt}`, `${delivery.cargo} (${cargo_mass})`, `${unittxt}${profit}`]);
            }

            PushTable("#table_delivery_log", data, total_pages, "LoadDeliveryList();");
        },
        error: function (data) {
            UnlockBtn("#button-delivery-log-options-update");
            AjaxError(data);
        }
    })
}

function ShowDeliveryLogExport(){
    modalid = ShowModal("Export Delivery Log", `
        <p>A csv table will be downloaded containing delivery logs of the selected date range.</p>
        <p><i>Rate limit: 3 downloads / hour</i></p>
        <label class="form-label">Date Range</label>
        <div class="input-group mb-2">
            <span class="input-group-text">From</span>
            <input type="date" class="form-control bg-dark text-white" id="delivery-log-export-start-time">
        </div>
        <div class="input-group mb-2">
            <span class="input-group-text">To</span>
            <input type="date" class="form-control bg-dark text-white" id="delivery-log-export-end-time">
        </div>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button id="button-delivery-log-export" type="button" class="btn btn-primary" onclick="DeliveryLogExport();">Export</button>`);
    InitModal("delivery_log_export", modalid);
}

function DeliveryLogExport(){
    var start_time = -1, end_time = -1;
    if ($("#delivery-log-export-start-time").val() != "" && $("#delivery-log-export-end-time").val() != "") {
        start_time = +new Date($("#delivery-log-export-start-time").val()) / 1000;
        end_time = +new Date($("#delivery-log-export-end-time").val()) / 1000 + 86400;
    }
    LockBtn("#button-delivery-log-export", "Exporting...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog/export",
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
            toastNotification("success", "Success", "Delivery log exported!", 5000);
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
    if (window.dn == undefined || window.dn.previousExtent_ == undefined) return toastNotification("error", "Error", "Please zoom & drag the map to activate it.", 5000, false);
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
                if(document.getElementById('delivery-detail-timeline-' + i) != null){
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
    if (window.dn == undefined || window.dn.previousExtent_ == undefined) return toastNotification("error", "Error", "Please zoom & drag the map to activate it.", 5000, false);
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
        url: apidomain + "/" + vtcprefix + "/dlog?logid=" + String(logid),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error){
                ShowTab("#delivery-tab", "#button-delivery-tab");
                return AjaxError(data);
            }
            
            window.history.pushState("", "", '/delivery/' + logid);

            d = data.response;
            currentDeliveryLog = d;
            user = d.user;
            distance = TSeparator(parseInt(d.distance * distance_ratio)) + distance_unit_txt;
            $("#delivery-detail-title").html(`Delivery #${logid} <a class="clickable" onclick="MoreDeliveryDetail()"><span class="rect-20"><i class="fa-solid fa-circle-info"></i></span></a>`);
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

            source_company = "Unknown company";
            source_city = "Unknown city";
            destination_company = "Unknown company";
            destination_city = "Unknown city";
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
            ECOLOR = {"started": "green", "delivered": "green", "cancelled": "red", "fine": "yellow", "tollgate": "white", "ferry": "white", "train": "white", "collision": "yellow", "repair": "green", "refuel": "green", "teleport": "green", "speeding": "yellow"}
            function GenTimelineItem(e, idx, title, content){
                $("#delivery-detail-timeline").append(`
                <li id="delivery-detail-timeline-${idx}" class="timeline-item timeline-${ECOLOR[e.type]} mb-5">
                    <h5 class="fw-bold">${title}</h5>
                    <p class="text-muted mb-2 fw-bold">${e.real_time}</p>
                    <p>${content}</p>
                </li>`);
            }

            rrevents = d.events;
            for(i=0;i<rrevents.length;i++){
                e = rrevents[i];
                meta = e.meta;
                if(e.type == "started"){
                    GenTimelineItem(e, i, `Job Started`, `From ${source_company}, ${source_city}`);
                } else if(e.type == "delivered"){
                    GenTimelineItem(e, i, `Job Delivered`, `To ${destination_company}, ${destination_city}<br>Earned ${punit}${TSeparator(meta.revenue)} & ${TSeparator(meta.earned_xp)} XP`);
                } else if(e.type == "cancelled"){
                    GenTimelineItem(e, i, `Job Cancelled`, `Penalty: ${punit}${TSeparator(meta.penalty)}`);
                } else if(e.type == "fine"){
                    if(meta.offence == "crash"){
                        GenTimelineItem(e, i, `Crash`, `Fined: ${punit}${TSeparator(meta.amount)}`);
                    } else if(meta.offence == "speeding"){
                        speed = TSeparator(parseInt(meta.speed * 3.6 * distance_ratio)) + distance_unit_txt + "/h";
                        speed_limit = TSeparator(parseInt(meta.speed_limit * distance_ratio)) + distance_unit_txt + "/h";
                        GenTimelineItem(e, i, `Speeding`, `Speed: ${speed} | Limit: ${speed_limit}<br>Fined: ${punit}${TSeparator(meta.amount)}`);
                    } else if(meta.offence == "wrong_way"){
                        GenTimelineItem(e, i, `Wrong Way`, `Fined: ${punit}${TSeparator(meta.amount)}`);
                    }
                } else if(e.type == "tollgate"){
                    GenTimelineItem(e, i, `Tollgate`, `Paid ${punit}${TSeparator(meta.cost)}`);
                } else if(e.type == "ferry"){
                    GenTimelineItem(e, i, `Ferry`, `${meta.source_name} -> ${meta.target_name}<br>Paid ${punit}${TSeparator(meta.cost)}`);
                } else if(e.type == "train"){
                    GenTimelineItem(e, i, `Train`, `${meta.source_name} -> ${meta.target_name}<br>Paid ${punit}${TSeparator(meta.cost)}`);
                } else if(e.type == "collision"){
                    damage = meta.wear_engine + meta.wear_chassis + meta.wear_transmission + meta.wear_cabin + meta.wear_wheels;
                    GenTimelineItem(e, i, `Collision`, `Truck Damage: ${(damage*100).toFixed(2)}%`);
                } else if(e.type == "repair"){
                    GenTimelineItem(e, i, `Repair`, `Truck repaired.`);
                } else if(e.type == "refuel"){
                    fuel = TSeparator(parseInt(meta.amount * fuel_ratio)) + fuel_unit_txt;
                    GenTimelineItem(e, i, `Refuel`, `Refueled ${fuel} fuel.`);
                } else if(e.type == "teleport"){
                    GenTimelineItem(e, i, `Teleport`, `Teleported to another location.`);
                } else if(e.type == "speeding"){
                    speed = TSeparator(parseInt(meta.max_speed * 3.6 * distance_ratio)) + distance_unit_txt + "/h";
                    speed_limit = TSeparator(parseInt(meta.speed_limit * 3.6 * distance_ratio)) + distance_unit_txt + "/h";
                    GenTimelineItem(e, i, `Speeding`, `Speed: ${speed} | Limit: ${speed_limit}<br>Duration: ${meta.end-meta.start} seconds<br><i>Not fined</i>`);
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
            
            telemetry = data.response.telemetry.split(";");
            basic = telemetry[0].split(",");
            tver = 1;
            if (basic[0].startsWith("v2")) tver = 2;
            else if (basic[0].startsWith("v3")) tver = 3;
            else if (basic[0].startsWith("v4")) tver = 4;
            else if (basic[0].startsWith("v5")) tver = 5;
            else if (basic[0].startsWith("v")) {
                $("#dmap").prepend(`
                <div style="position:absolute;z-index:10;padding:10px;">
                    <h5>Delivery Route <span style="color:red">Not Available</span></h5>
                    <p style="font-size:12px">Potential reasons: Navio Live not enabled, offline when driving</p>
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
                                cx = route.substr(i + 1, j - i -1);
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
                        if (cx == 0 && cz == 0){continue;}
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
                    <h5>Delivery Route <span style="color:red">Not Available</span></h5>
                    <p style="font-size:12px">Potential reasons: Navio Live not enabled, offline when driving</p>
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

function MoreDeliveryDetail(){
    function GenTableRow(key, val){
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
    if(d.detail.type == "job.delivered"){
        t = d.detail.data.object;
        auto_park = t.events[t.events.length-1].meta.auto_park;
        auto_load = t.events[t.events.length-1].meta.auto_load;
        extra = "";
        if(auto_park == "1") extra += `<span class="badge text-bg-primary">Auto Park</span>&nbsp;&nbsp;`;
        if(auto_load == "1") extra += `<span class="badge text-bg-primary">Auto Load</span>`;
        info += GenTableRow("Log ID", d.logid + "&nbsp;&nbsp;" + extra);
    } else { 
        info += GenTableRow("Log ID", d.logid);
    }
    info += GenTableRow("Navio ID", d.detail.data.object.id);
    info += GenTableRow("Time Submitted", getDateTime(d.timestamp * 1000));
    info += GenTableRow("Time Spent", duration);
    isdelivered = false;
    if(d.detail.type == "job.delivered"){
        isdelivered = true;
        info += GenTableRow("Status", "<span style='color:lightgreen'>Delivered</span>");
    } else if(d.detail.type == "job.cancelled"){
        info += GenTableRow("Status", "<span style='color:red'>Cancelled</span>");
    }
    if(d.telemetry != ""){
        info += GenTableRow("Delivery Route", "<span style='color:lightgreen'>Available</span>");
    } else {
        info += GenTableRow("Delivery Route", "<span style='color:red'>Unavailable</span>");
    }
    info += GenTableRow("Division", `<span id="delivery-detail-division"><button id="button-delivery-detail-division" type="button" class="btn btn-primary"  onclick="GetDivisionInfo(${d.logid});">Check</button></span>`);

    info += GenTableRow("&nbsp;","&nbsp;");
    info += GenTableRow("Driver", GetAvatar(d.user.userid, d.user.name, d.user.discordid, d.user.avatar));
    
    d = d.detail.data.object;

    source_company = "Unknown company";
    source_city = "Unknown city";
    destination_company = "Unknown company";
    destination_city = "Unknown city";
    source_company_id = "";
    destination_company_id = "";
    if (d.source_company != null) source_company = d.source_company.name, source_company_id = d.source_company.unique_id;
    if (d.source_city != null) source_city = d.source_city.name;
    if (d.destination_company != null) destination_company = d.destination_company.name, destination_company_id = d.destination_company.unique_id;
    if (d.destination_city != null) destination_city = d.destination_city.name;
    info += GenTableRow("Source Company", source_company);
    info += GenTableRow("Source City", source_city);
    info += GenTableRow("Destination Company", destination_company);
    info += GenTableRow("Destination City", destination_city);
    info += GenTableRow("Logged Distance", distance);
    if(isdelivered){
        distance2 = d.events[d.events.length-1].meta.distance;
        distance2_org = d.events[d.events.length-1].meta.distance
        distance2 = TSeparator(parseInt(distance2 * distance_ratio)) + distance_unit_txt;
        info += GenTableRow("Reported Distance", distance2);
        revenue = TSeparator(d.events[d.events.length-1].meta.revenue);
    } else {
        penalty = TSeparator(d.events[d.events.length-1].meta.penalty);
    }
    distance3 = d.planned_distance;
    distance3 = TSeparator(parseInt(distance3 * distance_ratio)) + distance_unit_txt;
    info += GenTableRow("Planned Distance", distance3);
    
    info += GenTableRow("&nbsp;","&nbsp;");
    cargo = d.cargo.name;
    cargo_mass = TSeparator(parseInt(d.cargo.mass * weight_ratio)) + weight_unit_txt;
    info += GenTableRow("Cargo", cargo);
    info += GenTableRow("Cargo Mass", cargo_mass);
    truck = d.truck.brand.name + " " + d.truck.name;
    truck_brand_id = d.truck.brand.unique_id;
    license_plate = d.truck.license_plate;
    trailer = "";
    trs = "";
    if (d.trailers.length > 1) trs = "s";
    for (var i = 0; i < d.trailers.length; i++) trailer += d.trailers[i].license_plate + " | ";
    trailer = trailer.slice(0,-3);
    info += GenTableRow("Truck", truck);
    info += GenTableRow("Truck Plate", license_plate);
    info += GenTableRow("Trailer Plate", trailer);

    info += GenTableRow("&nbsp;","&nbsp;");
    fuel_used_org = d.fuel_used;
    fuel_used = TSeparator(parseInt(d.fuel_used * fuel_ratio)) + fuel_unit_txt;
    info += GenTableRow("Fuel", fuel_used);
    if(isdelivered){
        avg_fuel = TSeparator(parseInt((fuel_used_org * fuel_ratio) / (distance2_org * distance_ratio) * 100)) + fuel_unit_txt + "/100" + distance_unit_txt;
    } else {
        avg_fuel = TSeparator(parseInt((fuel_used_org * fuel_ratio) / (distance_org * distance_ratio) * 100)) + fuel_unit_txt + "/100" + distance_unit_txt;
    }
    info += GenTableRow("Avg. Fuel", avg_fuel);
    info += GenTableRow("AdBlue", d.adblue_used);
    top_speed = parseInt(d.truck.top_speed * 3.6 * distance_ratio) + distance_unit_txt + "/h";
    average_speed = parseInt(d.truck.average_speed * 3.6 * distance_ratio) + distance_unit_txt + "/h";
    info += GenTableRow("Max. Speed", top_speed);
    info += GenTableRow("Avg. Speed", average_speed);

    info += GenTableRow("&nbsp;","&nbsp;");
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
    if(isdelivered){
        info += GenTableRow("Revenue", `${punit}${revenue}`);
    } else {
        info += GenTableRow("Penalty", `${punit}${penalty}`);
    }
    info += GenTableRow("Offence", `${punit}${offence}`);
    
    info += GenTableRow("&nbsp;","&nbsp;");
    if(d.is_special == true){
        info += GenTableRow("Is Special Transport?", "<span style='color:lightgreen'>Yes</span>");
    } else {
        info += GenTableRow("Is Special Transport?", "No");
    }
    if(d.is_late == true){
        info += GenTableRow("Is Late?", "<span style='color:red'>Yes</span>");
    } else {
        info += GenTableRow("Is Late?", "<span style='color:lightgreen'>No</span>");
    }
    if(d.has_police_enabled == true){
        info += GenTableRow("Has Polic Enabled?", "<span style='color:lightgreen'>Yes</span>");
    } else {
        info += GenTableRow("Has Polic Enabled?", "<span style='color:red'>No</span>");
    }
    
    MARKET = {"cargo_market": "Cargo Market", "freight_market": "Freight Market", "quick_job": "Quick Job", "external_contracts": "External Contracts"};
    mkt = "Unknown";
    if(Object.keys(MARKET).includes(d.market)) mkt = MARKET[d.market];
    info += GenTableRow("Market", mkt);
    mode = "Single Player";
    if(d.multiplayer != null){
        mode = "Multiplayer";
        if(d.multiplayer.type == "truckersmp"){
            mode = "TruckersMP";
        } else if(d.multiplayer.type == "scs_convoy"){
            mode = "SCS Convoy";
        }
    }
    info += GenTableRow("Mode", mode);

    info += "</table>";

    modalid = ShowModal(`Delivery Log`, info);
    InitModal("delivery_log_detail", modalid);
}
function LoadXOfTheMonth(){
    if($("#member-tab-left").is(":visible")) return;
    if(perms.driver_of_the_month != undefined){
        dotm_role = perms.driver_of_the_month[0];
        
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/member/list?page=1&page_size=1&roles=" + dotm_role,
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
                $("#driver-of-the-month-info").html(`<img src="${avatar}" width="60%" style="border-radius:100%" onerror="$(this).attr('src','https://drivershub-cdn.charlws.com/assets/`+vtcprefix+`/logo.png'");><br><a style="cursor: pointer" onclick="LoadUserProfile(${userid})">${name}</a>`);
                $("#driver-of-the-month").show();

                $("#member-tab-left").show();
                $("#member-tab-right").addClass("col-8");
            }
        })
    }
    if(perms.staff_of_the_month != undefined){
        sotm_role = perms.staff_of_the_month[0];
        
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/member/list?page=1&page_size=1&roles=" + sotm_role,
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
                $("#staff-of-the-month-info").html(`<img src="${avatar}" width="60%" style="border-radius:100%" onerror="$(this).attr('src','https://drivershub-cdn.charlws.com/assets/${vtcprefix}/logo.png')";><br><a style="cursor: pointer" onclick="LoadUserProfile(${userid})">${name}</a>`);
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
        url: apidomain + "/" + vtcprefix + "/member/list?page=" + page + "&order_by=highest_role&order=desc&name=" + search_name,
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
                highestrole = user.roles[0];
                highestroleid = roles[0];
                highestrole = rolelist[highestrole];
                if (highestrole == undefined) highestrole = "/";
                if (avatar != null) {
                    if (avatar.startsWith("a_"))
                        src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif";
                    else
                        src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png";
                } else {
                    avatar = "https://drivershub-cdn.charlws.com/assets/"+vtcprefix+"/logo.png";
                }
                userop = ``;
                if(userPerm.includes("hr") || userPerm.includes("hrm") || userPerm.includes("admin")){
                    userop = `<div class="dropdown">
                    <a class="dropdown-toggle clickable" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Manage
                    </a>
                    <ul class="dropdown-menu dropdown-menu-dark member-manage-dropdown">
                        <li><a class="dropdown-item clickable" onclick="EditRolesShow(${userid})">Roles</a></li>
                        <li><a class="dropdown-item clickable" onclick="EditPointsShow(${userid}, '${name}')">Points</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item clickable" onclick="DismissMemberShow(${userid}, '${name}')" style="color:red">Dismiss</a></li>
                    </ul>
                </div>`;
                } else if(userPerm.includes(`division`)){
                    userop = `<div class="dropdown">
                    <a class="dropdown-toggle clickable" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Manage
                    </a>
                    <ul class="dropdown-menu dropdown-menu-dark">
                        <li><a class="dropdown-item clickable" onclick="EditRolesShow(${userid})">Roles</a></li>
                    </ul>
                </div>`;
                }
                data.push([`<img src='${src}' width="40px" style="display:inline;border-radius:100%" onerror="$(this).attr('src','https://drivershub-cdn.charlws.com/assets/`+vtcprefix+`/logo.png');">`, `<a style="cursor: pointer" onclick="LoadUserProfile(${userid})">${name}</a>`, `${highestrole}`, userop]);
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
        url: apidomain + "/" + vtcprefix + "/user?userid=" + uid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            d = data.response;
            roles = d.roles;

            roled = `
            <div>
                <label class="form-label">Roles</label>
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
                if (roleids[i] <= highestroleid) disabled = "disabled";
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
            
            modalid = ShowModal(`${d.name} (${d.userid})`, roled, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button><button id="button-edit-roles" type="button" class="btn btn-primary" onclick="EditRoles(${d.userid});">Update</button>`);
            InitModal("edit_roles", modalid);
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

function EditRoles(uid) {
    LockBtn("#button-edit-roles", "Updating...");

    d = $('input[name="edit-roles"]:checked');
    roles = [];
    for (var i = 0; i < d.length; i++) {
        roles.push(d[i].id.replaceAll("edit-roles-", ""));
    }

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/roles",
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
            toastNotification("success", "Success!", "Member roles updated!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-edit-roles");
            AjaxError(data);
        }
    });
}

function EditPointsShow(uid, name){
    div = `
    <label class="form-label">Points</label>
    <div class="input-group mb-2">
        <span class="input-group-text" id="edit-points-distance-label">Distance</span>
        <input type="number" class="form-control bg-dark text-white" id="edit-points-distance" placeholder="0" aria-describedby="edit-points-distance-label">
    </div>
    <div class="input-group mb-3">
        <span class="input-group-text" id="edit-points-myth-label">Myth</span>
        <input type="number" class="form-control bg-dark text-white" id="edit-points-myth" placeholder="0" aria-describedby="edit-points-myth-label">
    </div>`;
    modalid = ShowModal(`${name} (${uid})`, div, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button><button id="button-edit-points" type="button" class="btn btn-primary" onclick="EditPoints(${uid});">Update</button>`);
    InitModal("edit_points", modalid);
}

function EditPoints(uid) {
    LockBtn("#button-edit-points");

    distance = $("#edit-points-distance").val();
    mythpoint = $("#edit-points-myth").val();
    if (!isNumber(distance)) distance = 0;
    if (!isNumber(mythpoint)) mythpoint = 0;
    
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/point",
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
            toastNotification("success", "Success!", "Member points updated!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-edit-points");
            AjaxError(data);
        }
    });
}

function DismissMemberShow(uid, name){
    modalid = ShowModal(`Dismiss Member`, `<p>Are you sure you want to dismiss this member?</p><p><i>${name} (User ID: ${uid})</i></p><br><p>Dismissing ${name} will erase all their delivery log (marking them as by unknown user) and remove them from Navio company. This cannot be undone.`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button id="button-dismiss-member" type="button" class="btn btn-danger" onclick="DismissMember(${uid});">Dismiss</button>`);
    InitModal("dismiss_member", modalid);
}

function DismissMember(uid){
    LockBtn("#dismiss-member", "Dismissing...");
    
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/dismiss?userid=" + uid,
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#dismiss-member");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", "Member dismissed!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#dismiss-member");
            AjaxError(data);
        }
    });
}

function GetDiscordRankRole() {
    GeneralLoad();
    LockBtn(".requestRoleBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/roles/rank",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn(".requestRoleBtn");
            if (data.error) return toastNotification("error", "Error", data.descriptor, 5000, false);
            else return toastNotification("success", "Success", "You have got your new role!", 5000, false);
        },
        error: function (data) {
            UnlockBtn(".requestRoleBtn");
            AjaxError(data);
        }
    })
}

function UserResign() {
    if ($("#resignBtn").html() != "Confirm?") {
        $("#resignBtn").html("Confirm?");
        return;
    }

    GeneralLoad();
    LockBtn("#resignBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/resign",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#resignBtn");
            if (data.error) return AjaxError(data);

            localStorage.clear();
            Swal.fire({
                title: "Resigned",
                html: "Sorry to see you leave, good luck with your future career!",
                icon: 'info',
                confirmButtonText: 'Close'
            });

            setTimeout(function(){window.location.reload()}, 5000);
        },
        error: function (data) {
            UnlockBtn("#resignBtn");
            AjaxError(data);
        }
    });
}

useridCurrentProfile = -1;

function LoadUserProfile(userid) {
    if (userid < 0) return;

    $("#overview-chart-scale-1").attr("onclick", `chartscale=1;LoadChart(${userid});`);
    $("#overview-chart-scale-2").attr("onclick", `chartscale=2;LoadChart(${userid});`);
    $("#overview-chart-scale-3").attr("onclick", `chartscale=3;LoadChart(${userid});`);
    $("#overview-chart-sum").attr("onclick", `addup=1-addup;LoadChart(${userid});`);
    LoadChart(userid);

    $("#udpages").val("1");
    useridCurrentProfile = userid;

    LoadUserDeliveryList(userid);

    if (userid == parseInt(localStorage.getItem("userid"))) { // current user
        LoadUserSessions();
        $("#userSessions").show();
    } else {
        $("#userSessions").hide();
    }

    if (curtab != "#ProfileTab") {
        ShowTab("#ProfileTab", userid);
        return;
    }

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user?userid=" + String(userid),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            window.history.pushState("", "", '/member/' + userid);
            if (data.error) {
                ShowTab("#overview-tab", "#button-overview-tab");
                return AjaxError(data);
            }

            d = data.response;
            $("#account_id").html(d.userid + " (" + getDateTime(d.join_timestamp * 1000) + ")");
            if (d.email != undefined) {
                $("#account_email").html(d.email);
                $(".email_private").show();
            } else $(".email_private").hide();
            $("#account_discordid").html(d.discordid);
            $("#account_steamid").html(d.steamid);
            $("#account_truckersmpid").html(d.truckersmpid);
            info = "";
            info += "<h1 style='font-size:40px'><b>" + d.name + "</b></h1>";
            info += "" + parseMarkdown(d.bio);
            $("#userProfileDetail").html(info);
            
            avatar = GetAvatarSrc(d.discordid, d.avatar);
            $("#UserProfileAvatar").attr("src", avatar);
            
            roles = d.roles;
            rtxt = "";
            for (var i = 0; i < roles.length; i++) {
                if (roles[i] == 0) color = "rgba(127,127,127,0.4)";
                else if (roles[i] < 10) color = vtccolor;
                else if (roles[i] <= 98) color = "#ff0000";
                else if (roles[i] == 99) color = "#4e6f7b";
                else if (roles[i] == 100) color = vtccolor;
                else if (roles[i] > 100) color = "grey";
                if (roles[i] == 223 || roles[i] == 224) color = "#ffff77;color:black;";
                if (roles[i] == 1000) color = "#9146ff";
                if (rolelist[roles[i]] != undefined) rtxt += `<span class='tag' title="${rolelist[roles[i]]}" style='max-width:fit-content;margin-bottom:15px;display:inline;background-color:${color};white-space:nowrap;'>` + rolelist[roles[i]] + "</span> ";
                else rtxt += "Unknown Role (ID " + roles[i] + "), ";
            }
            rtxt = rtxt.substring(0, rtxt.length - 2);
            $("#profileRoles").html(rtxt);

            if (d.userid == localStorage.getItem("userid")) {
                $("#UpdateAM").show();
                $(".account_private").show();
                $("#Security").show();
                $("#biocontent").val(d.bio);
                if(d.mfa == false){
                    $("#button-enable-mfa-modal").show();
                    $("#p-mfa-enabled").hide();
                } else {
                    $("#button-enable-mfa-modal").hide();
                    $("#p-mfa-enabled").show();
                }
            } else {
                $("#UpdateAM").hide();
                $(".account_private").hide();
                $("#Security").hide();
            }

            $("#user_statistics").html("Loading...");
            $.ajax({
                url: apidomain + "/" + vtcprefix + "/dlog/statistics/summary?userid=" + String(userid),
                type: "GET",
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                success: async function (data) {
                    if (!data.error) {
                        d = data.response;
                        info = "";
                        info += `<p><b>Jobs</b>: ${TSeparator(d.job.all.sum.tot)}</p><p> ${TSeparator(d.job.all.ets2.tot)} in ETS2 + ${TSeparator(d.job.all.ats.tot)} in ATS</p>`;
                        info += ` <p> ${TSeparator(d.job.delivered.sum.tot)} Delivered + ${TSeparator(d.job.cancelled.sum.tot)} Cancelled</p><br>`;

                        dtot = TSeparator(d.distance.all.sum.tot * distance_ratio) + distance_unit_txt;
                        dets2 = TSeparator(d.distance.all.ets2.tot * distance_ratio) + distance_unit_txt;
                        dats = TSeparator(d.distance.all.ats.tot * distance_ratio) + distance_unit_txt;
                        info += `<p><b>Distance</b>: ${dtot}</p><p> ${dets2} in ETS2 + ${dats} in ATS</p><br>`;

                        dtot = TSeparator(d.fuel.all.sum.tot * fuel_ratio) + fuel_unit_txt;
                        dets2 = TSeparator(d.fuel.all.ets2.tot * fuel_ratio) + fuel_unit_txt;
                        dats = TSeparator(d.fuel.all.ats.tot * fuel_ratio) + fuel_unit_txt;
                        info += `<p><b>Fuel</b>: ${dtot}</p><p> ${dets2} in ETS2 + ${dats} in ATS</p><br>`;

                        info += "<p><b>Profit</b>: €" + TSeparator(d.profit.all.tot.euro) + " (ETS2) + $" + TSeparator(d.profit.all.tot.dollar) + " (ATS)</p>";
                        info += "<p><b>Including cancellation penalty</b>: -€" + TSeparator(-d.profit.cancelled.tot.euro) + " - $" + TSeparator(-d.profit.cancelled.tot.dollar) + "</p><br>";

                        $("#user_statistics").html(info);

                        $.ajax({
                            url: apidomain + "/" + vtcprefix + "/dlog/leaderboard?point_types=distance,event,division,myth&userids=" + String(userid),
                            type: "GET",
                            dataType: "json",
                            headers: {
                                "Authorization": "Bearer " + localStorage.getItem("token")
                            },
                            success: async function (data) {
                                if (!data.error) {
                                    info += "<hr><br>";
                                    d = data.response.list[0];
                                    info += "<p><b>Points</b></p>";
                                    info += `<p>Distance: ${d.points.distance}</p>`;
                                    info += `<p>Event: ${d.points.event}</p>`;
                                    info += `<p>Division: ${d.points.division}</p>`;
                                    info += `<p>Myth: ${d.points.myth}</p>`;
                                    info += `<p><b>Total: ${d.points.total_no_limit}</b></p>`;
                                    info += `<p><b>Rank: #${d.points.rank_no_limit} (${point2rank(d.points.total_no_limit)})</b></p>`;
                                    if (String(userid) == localStorage.getItem("userid")) {
                                        info += `
                                    <button type="button" style="font-size:16px;padding:10px;padding-top:5px;padding-bottom:5px"
                                        class="requestRoleBtn w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                        onclick="GetDiscordRankRole()">Request Discord Role</button>`;
                                    }
                                    $("#user_statistics").html(info);
                                }
                            },
                            error: async function (data) {
                                $("#user_statistics").html(info);
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

mfa_secret = "";
function EnableMFAModal(){
    mfa_secret = RandomString(16).toUpperCase();
    Swal.fire({
        title: "Enable MFA",
        html: `<p style="text-align:left">Please download MFA app, enter the secret <b>${mfa_secret}</b>, then enter the generated OTP below. (QR Code is not supported yet).</p><br>
        <p id="p-mfa-message" style="color:red;text-align:left"></p>
        <input id="input-mfa-otp"
            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
            type="text" name="" placeholder="000 000">
        <button type="button" id="button-enable-mfa" style="float:right"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="EnableMFA()">Enable</button>`,
        icon: 'info',
        showConfirmButton: false,
        confirmButtonText: 'Close'
    });
}

function EnableMFA(){
    otp = $("#input-mfa-otp").val();
    if(!isNumber(otp) || otp.length != 6){
        $("#p-mfa-message").html("Invalid OTP!");
        return;
    }

    GeneralLoad();
    LockBtn("#button-enable-mfa");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/auth/mfa",
        type: "PUT",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            secret: mfa_secret,
            otp: otp
        },
        success: function (data) {
            UnlockBtn("#button-enable-mfa");
            if (data.error){
                $("#p-mfa-message").html(data.descriptor);
                return;
            }
            
            toastNotification("success", "Success", "MFA Enabled.", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-enable-mfa");
            $("#p-mfa-message").html(JSON.parse(data.responseText).descriptor);
        }
    });
}
sc = undefined;
chartscale = 3;
addup = 1;

async function LoadChart(userid = -1) {
    if (userid != -1) {
        $(".ucs").css("background-color", "");
        $("#ucs" + chartscale).css("background-color", "skyblue");
        $("#uaddup" + addup).css("background-color", "skyblue");
    } else {
        $("#overview-chart-scale-group").children().removeClass("active");
        $("#overview-chart-scale-"+chartscale).addClass("active");
        if(!addup) $("#overview-chart-sum").removeClass("active");
        else $("#overview-chart-sum").addClass("active");
    }
    pref = "s";
    if (userid != -1) pref = "userS";
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog/statistics/chart?scale=" + chartscale + "&sum_up=" + addup + "&userid=" + userid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            d = data.response;
            const ctx = document.getElementById(pref + 'tatisticsChart').getContext('2d');
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
                $(pref + 'tatisticsChart').remove();
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
        url: apidomain + "/" + vtcprefix + "/dlog/statistics/summary?start_time=" + stats_start_time + "&end_time=" + stats_end_time,
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

            // const ctx = document.getElementById('deliveryStatsChart').getContext('2d');
            // const config = {
            //     type: 'pie',
            //     data: {
            //         labels: ['Euro Truck Simulator 2', 'American Truck Simulator'],
            //         datasets: [{
            //             label: 'Game Preference',
            //             data: [d.job.all.ets2.tot, d.job.all.ats.tot],
            //             backgroundColor: ["skyblue", "pink"],
            //         }]
            //     },
            //     options: {
            //         responsive: true,
            //         plugins: {
            //             legend: {
            //                 position: 'top',
            //             },
            //             title: {
            //                 display: true,
            //                 text: 'Game Preference'
            //             }
            //         }
            //     },
            // };
            // if (deliveryStatsChart != undefined) deliveryStatsChart.destroy();
            // deliveryStatsChart = new Chart(ctx, config);
        }
    });
}

function LoadStats(basic = false) {
    if (curtab != "#overview-tab" && curtab != "#delivery-tab") return;
    LoadChart();

    stats_start_time = parseInt(+ new Date() / 1000 - 86400);
    stats_end_time = parseInt(+ new Date() / 1000);
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog/statistics/summary?start_time=" + stats_start_time + "&end_time=" + stats_end_time,
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

            // const ctx = document.getElementById('deliveryStatsChart').getContext('2d');
            // const config = {
            //     type: 'pie',
            //     data: {
            //         labels: ['Euro Truck Simulator 2', 'American Truck Simulator'],
            //         datasets: [{
            //             label: 'Game Preference',
            //             data: [d.job.all.ets2.tot, d.job.all.ats.tot],
            //             backgroundColor: ["skyblue", "pink"],
            //         }]
            //     },
            //     options: {
            //         responsive: true,
            //         plugins: {
            //             legend: {
            //                 position: 'top',
            //             },
            //             title: {
            //                 display: true,
            //                 text: 'Game Preference'
            //             }
            //         }
            //     },
            // };
            // if (deliveryStatsChart != undefined) deliveryStatsChart.destroy();
            // deliveryStatsChart = new Chart(ctx, config);
        }
    });

    // get weekly data
    start_time = parseInt(+ new Date() / 1000 - 86400 * 7);
    end_time = parseInt(+ new Date() / 1000);
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog/statistics/summary?start_time=" + start_time + "&end_time=" + end_time,
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
            url: apidomain + "/" + vtcprefix + "/dlog/leaderboard",
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
                        avatar = "https://drivershub-cdn.charlws.com/assets/"+vtcprefix+"/logo.png";
                    }
                    $("#table_mini_leaderboard_data").append(`<tr>
              <td>
                <img src='${src}' width="40px" style="display:inline;border-radius:100%" onerror="$(this).attr('src','https://drivershub-cdn.charlws.com/assets/`+vtcprefix+`/logo.png');"></td>
            <td><a style="cursor: pointer" onclick="LoadUserProfile(${userid})">${name}</a></td>
              <td>${totalpnt}</td>
            </tr>`);
                }
            }
        });
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/member/list?page=1&order_by=join_timestamp&order=desc",
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
                        avatar = "https://drivershub-cdn.charlws.com/assets/"+vtcprefix+"/logo.png";
                    }
                    $("#table_new_driver_data").append(`<tr>
              <td>
                <img src='${src}' width="40px" style="display:inline;border-radius:100%" onerror="$(this).attr('src','https://drivershub-cdn.charlws.com/assets/`+vtcprefix+`/logo.png');"></td>
                <td><a style="cursor: pointer" onclick="LoadUserProfile(${userid})">${name}</a></td>
              <td>${joindt}</td>
            </tr>`);
                }
            }
        });
    }
}
function LoadAuditLog() {
    GeneralLoad();
    InitPaginate("#table_audit_log", "LoadAuditLog();")
    page = parseInt($("#table_audit_log_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;
    
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/audit?page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            auditLog = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < auditLog.length; i++) {
                audit = auditLog[i];
                dt = getDateTime(audit.timestamp * 1000);
                op = parseMarkdown(audit.operation).replace("\n", "<br>");

                data.push([`${audit.user.name}`, `${op}`, `${dt}`]);
            }

            PushTable("#table_audit_log", data, total_pages, "LoadAuditLog();");
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function UpdateBio() {
    GeneralLoad();
    LockBtn("#updateBioBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/bio",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "bio": $("#biocontent").val()
        },
        success: function (data) {
            UnlockBtn("#updateBioBtn");
            if (data.error) return AjaxError(data);
            LoadUserProfile(localStorage.getItem("userid"));
            toastNotification("success", "Success!", "About Me updated!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#updateBioBtn");
            AjaxError(data);
        }
    });
}

function RenewApplicationToken() {
    GeneralLoad();
    LockBtn("#genAppTokenBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/token/application",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#genAppTokenBtn");
            if (data.error) return AjaxError(data);
            $("#userAppToken").html(data.response.token);
            toastNotification("success", "Success", "Application Token generated!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#genAppTokenBtn");
            AjaxError(data);
        }
    });
}

function DisableApplicationToken() {
    GeneralLoad();
    LockBtn("#disableAppTokenBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/token/application",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#disableAppTokenBtn");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", "Application Token Disabled!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#disableAppTokenBtn");
            AjaxError(data);
        }
    });
}

bannedUserList = {};

function LoadUserList() {
    GeneralLoad();
    InitPaginate("#table_pending_user_list", "LoadUserList();");
    page = parseInt($("#table_pending_user_list_page_input").val())
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/list?page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            userList = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < userList.length; i++) {
                user = userList[i];
                bantxt = "Ban";
                bantxt2 = "";
                color = "";
                accept = `<td class="py-5 px-6 font-medium"><a style="cursor:pointer;color:grey">Accept as member</td>`;
                if (user.ban.is_banned) color = "grey", bantxt = "Unban", bantxt2 = "(Banned)", bannedUserList[user.discordid] = user.ban.ban_reason;
                else accept = `<td class="py-5 px-6 font-medium"><a style="cursor:pointer;color:lightgreen" id="UserAddBtn${user.discordid}" onclick="AddUser('${user.discordid}')">Accept as member</td>`;

                data.push([`<span style='color:${color}'>${user.discordid}</span>`, `<span style='color:${color}'>${user.name} ${bantxt2}</span>`, `<a style="cursor:pointer;color:red" onclick="banGo('${user.discordid}')">${bantxt}</a>`, `<button type="button" style="display:inline;padding:5px" id="UserInfoBtn${user.discordid}" 
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="GetUserDetail('${user.discordid}')">Details</button>`]);
            }

            PushTable("#table_pending_user_list", data, total_pages, "LoadUserList();");
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function banGo(discordid) {
    $("#bandiscordid").val(discordid);
    document.getElementById("BanUserDiv").scrollIntoView();
}

function AddUser(discordid = -1) {
    if (discordid == "-1") {
        discordid = $("#adddiscordid").val();
        if (!isNumber(discordid)) {
            return toastNotification("error", "Error", "Please enter a valid discord id.", 5000, false);
        }
    } else {
        if ($("#UserAddBtn" + discordid).html() != "Confirm?") {
            $("#UserAddBtn" + discordid).html("Confirm?");
            $("#UserAddBtn" + discordid).css("color", "orange");
            return;
        }
    }
    GeneralLoad();
    LockBtn("#addUserBtn");
    LockBtn("#UserAddBtn" + discordid);
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member",
        type: "PUT",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: discordid
        },
        success: function (data) {
            UnlockBtn("#addUserBtn");
            UnlockBtn("#UserAddBtn" + discordid);
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", "User added successfully. User ID: " + data.response.userid, 5000, false);
            LoadUserList();
        },
        error: function (data) {
            UnlockBtn("#addUserBtn");
            UnlockBtn("#UserAddBtn" + discordid);
            AjaxError(data);
        }
    })
}

function UpdateUserDiscordAccount() {
    GeneralLoad();
    LockBtn("#updateDiscordBtn");

    old_discord_id = $("#upd_old_id").val();
    new_discord_id = $("#upd_new_id").val();
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/discord",
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
            UnlockBtn("#updateDiscordBtn");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", "User Discord Account Updated!", 5000, false);
            LoadUserList();
        },
        error: function (data) {
            UnlockBtn("#updateDiscordBtn");
            AjaxError(data);
        }
    })
}

function DeleteUserAccount() {
    GeneralLoad();
    LockBtn("#deleteUserBtn");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: $("#del_discord_id").val()
        },
        success: function (data) {
            UnlockBtn("#deleteUserBtn");
            if (data.error) return AjaxError(data);
            LoadUserList();
            toastNotification("success", "Success", "User deleted!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#deleteUserBtn");
            AjaxError(data);
        }
    })
}

function UnbindUserAccountConnections() {
    GeneralLoad();
    LockBtn("#unbindConnectionsBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/connections",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: $("#unbind_discord_id").val()
        },
        success: function (data) {
            UnlockBtn("#unbindConnectionsBtn");
            if (data.error) return AjaxError(data);
            LoadUserList();
            toastNotification("success", "Success", "User account connections unbound!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#unbindConnectionsBtn");
            AjaxError(data);
        }
    })
}

function GetUserDetail(discordid) {
    GeneralLoad();
    LockBtn("#UserInfoBtn" + discordid, "Loading...");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user?discordid=" + String(discordid),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#UserInfoBtn" + discordid);
            if (data.error) return AjaxError(data);
            
            d = data.response;
            info = "";
            info += "<p style='text-align:left'><b>Name:</b> " + d.name + "</p>";
            info += "<p style='text-align:left'><b>Email:</b> " + d.email + "</p>";
            info += "<p style='text-align:left'><b>Discord ID:</b> " + discordid + "</p>";
            info += "<p style='text-align:left'><b>TruckersMP ID:</b> <a href='https://truckersmp.com/user/" +
                d.truckersmpid + "'>" + d.truckersmpid + "</a></p>";
            info += "<p style='text-align:left'><b>Steam ID:</b> <a href='https://steamcommunity.com/profiles/" +
                d.steamid + "'>" + d.steamid + "</a></p><br>";

            swalicon = "info";
            bantxt = "";
            if (Object.keys(bannedUserList).indexOf(discordid) != -1) {
                info += "<p style='text-align:left'><b>Ban Reason:</b> " + bannedUserList[discordid] + "</p>";
                swalicon = "error";
                bantxt = " (Banned)";
            }
                
            Swal.fire({
                title: d.name + bantxt,
                html: info,
                icon: swalicon,
                confirmButtonText: 'Close'
            })
        },
        error: function (data) {
            UnlockBtn("#UserInfoBtn" + discordid);
            AjaxError(data);
        }
    });
}

function BanUser() {
    discordid = $("#bandiscordid").val();
    if (!isNumber(discordid)) 
        return toastNotification("error", "Error", "Invalid discord id.", 5000, false);

    GeneralLoad();
    LockBtn("#banUserBtn");

    expire = -1;
    if ($("#banexpire").val() != "")
        expire = +new Date($("#banexpire").val()) / 1000;

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/ban",
        type: "PUT",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: discordid,
            expire: expire,
            reason: $("#banreason").val()
        },
        success: function (data) {
            UnlockBtn("#banUserBtn");
            if (data.error) return AjaxError(data);
            LoadUserList();
            toastNotification("success", "Success", "User banned successfully.", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#banUserBtn");
            AjaxError(data);
        }
    })
}

function UnbanUser() {
    discordid = $("#bandiscordid").val();
    if (!isNumber(discordid))
        return toastNotification("error", "Error", "Invalid discord id.", 5000, false);
    
    GeneralLoad();
    LockBtn("#unbanUserBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/unban",
        type: "PUT",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: $("#bandiscordid").val()
        },
        success: function (data) {
            UnlockBtn("#unbanUserBtn");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", "User unbanned successfully.", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#unbanUserBtn");
            AjaxError(data);
        }
    })
}

configData = {};

function loadConfig() {
    newConfigData = JSON.parse($("#config").val());
    keys = Object.keys(newConfigData);
    for (i = 0; i < keys.length; i++) {
        $("#config_" + keys[i]).val(newConfigData[keys[i]]);
        if (keys[i] == "truckersmp_bind" || keys[i] == "in_guild_check") $("#config_" + keys[i]).val(String(newConfigData[keys[i]]));
        else if (keys[i] == "welcome_role_change") $("#config_welcome_role_change_txt").val(newConfigData[keys[i]].join(", "));
        else if (keys[i] == "delivery_post_gifs") $("#config_delivery_post_gifs_txt").val(newConfigData[keys[i]].join("\n"));
        else if (keys[i] == "ranks") {
            d = newConfigData[keys[i]];
            txt = "";
            for (j = 0; j < d.length; j++) {
                txt += d[j].distance + ", " + d[j].name + ", " + d[j].discord_role_id + "\n";
            }
            $("#config_ranks_txt").val(txt);
        } else if (keys[i] == "application_types") {
            d = newConfigData[keys[i]];
            txt = "";
            for (j = 0; j < d.length; j++) {
                txt += d[j].id + ", " + d[j].name + ", " + d[j].discord_role_id + ", " + d[j].staff_role_id.join('|') + ", " + d[j].message + ", " + d[j].webhook + ", " + d[j].note + "\n";
            }
            $("#config_application_types_txt").val(txt);
        } else if (keys[i] == "divisions") {
            d = newConfigData[keys[i]];
            txt = "";
            for (j = 0; j < d.length; j++) {
                txt += d[j].id + ", " + d[j].name + ", " + d[j].point + ", " + d[j].role_id + "\n";
            }
            $("#config_divisions_txt").val(txt);
        } else if (keys[i] == "perms") {
            d = Object.keys(newConfigData[keys[i]]);
            txt = "";
            for (j = 0; j < d.length; j++) {
                txt += d[j] + ": " + newConfigData[keys[i]][d[j]].join(", ") + "\n";
            }
            $("#config_perms_txt").val(txt);
        } else if (keys[i] == "roles") {
            d = Object.keys(newConfigData[keys[i]]);
            txt = "";
            for (j = 0; j < d.length; j++) {
                txt += d[j] + ", " + newConfigData[keys[i]][d[j]] + "\n";
            }
            $("#config_roles_txt").val(txt);
        }
    }
    configData = newConfigData;
}

function loadAdmin() {
    webdomain = apidomain.replaceAll("https://", "https://web.");
    $.ajax({
        url: webdomain + "/" + vtcprefix + "/config?domain=" + window.location.hostname,
        type: "GET",
        dataType: "json",
        success: function (data) {
            if (data.error) toastNotification("error", "Error", data.descriptor, 5000, false);
            webConfigData = data.response.config;
            webConfigKeys = Object.keys(webConfigData);
            for (var i = 0; i < webConfigKeys.length; i++) {
                key = webConfigKeys[i];
                $("#webconfig_" + key).val(webConfigData[key]);
            }
        },
        error: function (data) {
            AjaxError(data);
        }
    });

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/config",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastNotification("error", "Error", data.descriptor, 5000,
                false);

            configData = data.response.config;

            $("#config").val(JSON.stringify(configData, null, 4,
                (_, value) =>
                typeof value === 'number' && value > 1e10 ?
                BigInt(value) :
                value));

            loadConfig();

            $(".configFormData").on('input', function () {
                inputid = $(this).attr('id');
                configitem = inputid.replaceAll("config_", "");
                val = $(this).val();
                configData[configitem] = val;
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_distance_unit").on('input', function () {
                configitem = "distance_unit";
                configData[configitem] = $("#config_distance_unit").val();
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_truckersmp_bind").on('input', function () {
                configitem = "truckersmp_bind";
                if ($("#config_truckersmp_bind").val() == "true") configData[configitem] = true;
                else configData[configitem] = false;
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_in_guild_check").on('input', function () {
                configitem = "in_guild_check";
                if ($("#config_in_guild_check").val() == "true") configData[configitem] = true;
                else configData[configitem] = false;
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_welcome_role_change_txt").on('input', function () {
                txt = $("#config_welcome_role_change_txt").val();
                configData["welcome_role_change"] = txt.split(", ");
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_delivery_post_gifs_txt").on('input', function () {
                txt = $("#config_delivery_post_gifs_txt").val();
                configData["welcome_role_change"] = txt.split("\n");
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_ranks_txt").on('input', function () {
                d = [];
                v = $("#config_ranks_txt").val().split("\n");
                for (j = 0; j < v.length; j++) {
                    t = v[j].split(",");
                    if (t.length != 3) continue;
                    d.push({
                        "distance": t[0].replaceAll(" ", ""),
                        "name": t[1],
                        "discord_role_id": t[2].replaceAll(" ", "")
                    });
                }
                configData["ranks"] = d;
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_application_types_txt").on('input', function () {
                d = [];
                v = $("#config_application_types_txt").val().split("\n");
                for (j = 0; j < v.length; j++) {
                    t = v[j].split(",");
                    if (t.length != 7) continue;
                    d.push({
                        "id": t[0].replaceAll(" ", ""),
                        "name": t[1],
                        "discord_role_id": t[2].replaceAll(" ", ""),
                        "staff_role_id": t[3].replaceAll(" ", "").split("|"),
                        "message": t[4],
                        "webhook": t[5],
                        "note": t[6]
                    });
                }
                configData["application_types"] = d;
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_divisions_txt").on('input', function () {
                d = [];
                v = $("#config_divisions_txt").val().split("\n");
                for (j = 0; j < v.length; j++) {
                    t = v[j].split(",");
                    if (t.length != 4) continue;
                    d.push({
                        "id": t[0].replaceAll(" ", ""),
                        "name": t[1],
                        "point": t[2].replaceAll(" ", ""),
                        "role_id": t[3].replaceAll(" ", "")
                    });
                }
                configData["divisions"] = d;
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_perms_txt").on('input', function () {
                d = {};
                v = $("#config_perms_txt").val().split("\n");
                for (j = 0; j < v.length; j++) {
                    t = v[j].split(":");
                    if (t.length != 2) continue;
                    perm_name = t[0].replaceAll(" ", "");
                    perm_role_t = t[1].replaceAll(" ", "").split(",");
                    perm_role = [];
                    for (k = 0; k < perm_role_t.length; k++) {
                        if (perm_role_t[k] == "") continue;
                        perm_role.push(parseInt(perm_role_t[k]));
                    }
                    d[perm_name] = perm_role;
                }
                configData["perms"] = d;
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_roles_txt").on('input', function () {
                d = {};
                v = $("#config_roles_txt").val().split("\n");
                for (j = 0; j < v.length; j++) {
                    t = v[j].split(",");
                    if (t.length != 2) continue;
                    d[t[0]] = t[1];
                }
                configData["roles"] = d;
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config").on('input', function () {
                loadConfig();
            });
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

function UpdateWebConfig() {
    if($("#webconfig_apptoken").val().length != 36){
        return toastNotification("error", "Error", "Invalid application token!");
    }
    $("#updateWebConfigBtn").html("Working...");
    $("#updateWebConfigBtn").attr("disabled", "disabled");
    webdomain = apidomain.replaceAll("https://", "https://web.");
    $.ajax({
        url: webdomain + "/" + vtcprefix + "/config",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Application " + $("#webconfig_apptoken").val()
        },
        data: {
            domain: window.location.hostname,
            apidomain: apidomain.replaceAll("https://", ""),
            vtc_name: $("#webconfig_vtc_name").val(),
            vtc_color: $("#webconfig_vtc_color").val(),
            slogan: $("#webconfig_slogan").val(),
            company_distance_unit: $("#webconfig_company_distance_unit").val(),
            navio_company_id: $("#webconfig_navio_company_id").val(),
            logo_url: $("#webconfig_logo_url").val(),
            banner_url: $("#webconfig_banner_url").val(),
            bg_url: $("#webconfig_bg_url").val(),
            teamupdate_url: $("#webconfig_teamupdate_url").val(),
            custom_application: $("#webconfig_custom_application").val(),
            style: $("#webconfig_custom_style").val()
        },
        success: function (data) {
            $("#updateWebConfigBtn").html("Update");
            $("#updateWebConfigBtn").removeAttr("disabled");
            if (data.error) return toastNotification("error", "Error", data.descriptor, 5000, false);
            toastNotification("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            $("#updateWebConfigBtn").html("Update");
            $("#updateWebConfigBtn").removeAttr("disabled");
            AjaxError(data);
        }
    })
}

function UpdateConfig() {
    config = $("#config").val();
    try {
        config = JSON.parse(config);
    } catch {
        toastNotification("error", "Error", "Failed to parse config! Make sure it's in correct JSON Format!", 5000, false);
        return;
    }
    if (config["navio_token"] == "") delete config["navio_token"];
    if (config["discord_client_secret"] == "") delete config["discord_client_secret"];
    if (config["bot_token"] == "") delete config["bot_token"];
    $("#updateConfigBtn").html("Working...");
    $("#updateConfigBtn").attr("disabled", "disabled");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/config",
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
            $("#updateConfigBtn").html("Update");
            $("#updateConfigBtn").removeAttr("disabled");
            if (data.error) return toastNotification("error", "Error", data.descriptor, 5000, false);
            toastNotification("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            $("#updateConfigBtn").html("Update");
            $("#updateConfigBtn").removeAttr("disabled");
            AjaxError(data);
        }
    })
}

function ReloadServer() {
    otp = $("#input-reload-otp").val();
    if(!isNumber(otp) || otp.length != 6){
        return toastNotification("error", "Error", "Invalid OTP.", 5000, false);
    }
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/reload",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            otp: otp
        },
        success: function (data) {
            if (data.error) return toastNotification("error", "Error", data.descriptor, 5000, false);
            toastNotification("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function UpdatePassword() {
    GeneralLoad();
    LockBtn("#resetPasswordBtn");

    if($("#passwordUpd").val() == ""){
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/user/password",
            type: "DELETE",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                UnlockBtn("#resetPasswordBtn");
                if (data.error) return AjaxError(data);
                toastNotification("success", "Success", "Password login disabled", 5000, false);
            },
            error: function (data) {
                UnlockBtn("#resetPasswordBtn");
                AjaxError(data);
            }
        });
        return;
    }

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/password",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "password": $("#passwordUpd").val()
        },
        success: function (data) {
            UnlockBtn("#resetPasswordBtn");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            UnlockBtn("#resetPasswordBtn");
            AjaxError(data);
        }
    })
}

function LoadUserSessions() {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/token/all",
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
                    opbtn = `<button type="button" style="display:inline;padding:5px" id="revokeTokenBtn-${sessions[i].hash}"
                    class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                    onclick="RevokeToken('${sessions[i].hash}')">Revoke</button>`;
                else opbtn = `(Current)`;

                $("#table_session_data").append(`<tr class="text-sm">
                    <td class="py-5 px-6 font-medium">${sessions[i].ip}</td>
                    <td class="py-5 px-6 font-medium">${getDateTime(sessions[i].timestamp * 1000)}</td>
                    <td class="py-5 px-6 font-medium">${getDateTime((parseInt(sessions[i].timestamp) + 86400 * 7) * 1000)}</td>
                    <td class="py-5 px-6 font-medium">${opbtn}</td>
                </tr>`);
            }
        },
        error: function (data) {
            $("#userSessions").hide();
        }
    })
}

function RevokeToken(hsh) {
    if ($("#revokeTokenBtn-" + hsh).html() == "Revoke") {
        $("#revokeTokenBtn-" + hsh).html("Confirm?");
        $("#revokeTokenBtn-" + hsh).attr("background-color", "red");
        return;
    }

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/token/hash",
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
            LoadUserSessions();
            toastNotification("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function revokeAllToken(){
    if ($("#revokeAllBtn").html() == "Revoke All") {
        $("#revokeAllBtn").html("Confirm?");
        $("#revokeAllBtn").attr("background-color", "red");
        return;
    }
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/token/all",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            setTimeout(function(){ShowTab("#signin-tab", "#button-signin-tab");},1000);
            toastNotification("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}
annInit = 0;

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
        url: apidomain + "/" + vtcprefix + "/announcement?page=" + page,
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
                                    Public
                                </label>
                            </div>
                        <div class="form-check" style="display:inline-block;width:80px;">
                            <input class="form-check-input" type="radio" name="announcement-edit-${announcement.announcementid}-visibility" id="announcement-edit-${announcement.announcementid}-visibility-private" ${private_checked}>
                            <label class="form-check-label" for="announcement-edit-${announcement.announcementid}-visibility-private">
                                Private
                            </label>
                        </div>
                        <select style="display:inline-block;width:130px" class="form-select bg-dark text-white" aria-label="Default select example" id="announcement-edit-${announcement.announcementid}-type">
                            <option value="0" ${type_checked[0]}>Information</option>
                            <option value="1" ${type_checked[1]}>Event</option>
                            <option value="2" ${type_checked[2]}>Warning</option>
                            <option value="3" ${type_checked[3]}>Critical</option>
                            <option value="4" ${type_checked[4]}>Resolved</option>
                        </select>
                    </div>
                    <div style="display:inline">
                        <input type="text" class="form-control bg-dark text-white" id="announcement-edit-${announcement.announcementid}-discord-channel" placeholder="Channel ID" style="width: 150px;display:inline-block;margin-right:10px;">
                        <input type="text" class="form-control bg-dark text-white" id="announcement-edit-${announcement.announcementid}-discord-message" placeholder="Discord Message" style="width:250px;display:inline-block;">
                    </div>
                    <button id="button-announcement-edit-${announcement.announcementid}-save" type="button" class="btn btn-primary" style="float:right" onclick="EditAnnouncement(${announcement.announcementid});">Save</button></div>`;
                }
                content += `<div class="announcement shadow p-3 m-3 bg-dark rounded col" id="announcement-${announcement.announcementid}">
                    <h5 style="display:inline-block;${announcement_control_title_style}"><strong><span id="announcement-display-${announcement.announcementid}-title"> ${ANNOUNCEMENT_ICON[announcement.announcement_type]} ${announcement.title}</span>${announcement_control_top}</strong></h5>
                    ${announcement_control}
                    <h6 style="font-size:15px"><strong>${GetAvatar(author.userid, author.name, author.discordid, author.avatar)} | ${announcement_datetime}</strong></h6>
                    <p id="announcement-display-${announcement.announcementid}-content">${parseMarkdown(announcement.content.replaceAll("\n", "<br>"))}</p>
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
    content = $("#announcement-new-content").val();
    anntype = $("#announcement-new-type").find(":selected").val();
    if(!isNumber(anntype)){
        return toastNotification("warning", "Warning", "Please select an announcement type!", 3000);
    }
    is_private = $("#announcement-visibility-private").is(":checked");
    discord_channelid = $("#announcement-new-discord-channel").val();
    discord_message = $("#announcement-new-discord-message").val();
    if(!isNumber(discord_channelid)){
        discord_channelid = 0;
        discord_message = "";
    }
    LockBtn("#button-announcement-new-post", "Posting...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/announcement",
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
            toastNotification("success", "Success", "Announcement posted!", 5000, false);
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
    LockBtn("#button-announcement-edit-"+announcementid+"-save", "Saving...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/announcement?announcementid="+announcementid,
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
            toastNotification("success", "Success", "Edit saved!", 5000, false);
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
    modalid = ShowModal("Delete Announcement", `<p>Are you sure you want to delete this announcement?</p><p><i>${content}</i></p><br><p style="color:#aaa"><span style="color:lightgreen"><b>PROTIP:</b></span><br>You can hold down shift when clicking delete button to bypass this confirmation entirely.</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button id="button-announcement-delete-${announcementid}" type="button" class="btn btn-danger" onclick="DeleteAnnouncement(${announcementid});">Delete</button>`);
    InitModal("delete_announcement", modalid);
}

function DeleteAnnouncement(announcementid){
    LockBtn("#button-announcement-delete-"+announcementid, "Deleting...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/announcement?announcementid=" + announcementid,
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            UnlockBtn("#button-announcement-delete-"+announcementid);
            if (data.error) AjaxError(data);
            LoadAnnouncement(noplaceholder = false);
            toastNotification("success", "Success", "Announcement deleted!", 5000, false);
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

function SubmitApp() {
    GeneralLoad();
    LockBtn("#submitAppBttn");

    apptype = parseInt($("#appselect").find(":selected").attr("value"));
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
                data[question] = "*Invalid application question: Answer element not found!*";
            }
        } else {
            continue;
        }
    }
    data = JSON.stringify(data);

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/application",
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
            UnlockBtn("#submitAppBttn");
            if(data.error) return AjaxError(data);
            toastNotification("success", "Success", "Application submitted!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#submitAppBttn");
            AjaxError(data);
        }
    });
}
function LoadUserApplicationList() {
    GeneralLoad();
    InitPaginate("#table_my_application", "LoadUserApplicationList();");

    page = parseInt($("#table_my_application_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/application/list?page=" + page + "&application_type=0",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            STATUS = ["Pending", "Accepted", "Declined"];

            applicationList = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < applicationList.length; i++) {
                application = applicationList[i];
                apptype = applicationTypes[application.application_type];
                creation = getDateTime(application.submit_timestamp * 1000);
                closedat = getDateTime(application.update_timestamp * 1000);
                if (application.update_timestamp == 0)  closedat = "/";
                status = STATUS[application.status];

                color = "blue";
                if (application.status == 1) color = "lightgreen";
                if (application.status == 2) color = "red";

                data.push([`${application.applicationid}`, `${apptype}`, `${creation}`, `<span style="color:${color}">${status}</span>`, `${closedat}`, `<button type="button" style="display:inline;padding:5px" id="MyAppBtn${application.applicationid}" 
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="GetApplicationDetail(${application.applicationid})">Details</button>`]);
            }

            PushTable("#table_my_application", data, total_pages, "LoadUserApplicationList();");
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function AddMessageToApplication() {
    appid = $("#appmsgid").val();
    if (!isNumber(appid)) {
        toastNotification("error", "Error", "Please enter a valid application ID.", 5000, false);
        return;
    }
    message = $("#appmsgcontent").val();
    LockBtn("#addAppMessageBtn");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/application",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "applicationid": appid,
            "message": message
        },
        success: function (data) {
            UnlockBtn("#addAppMessageBtn");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success!", "Message added!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#addAppMessageBtn");
            AjaxError(data);
        }
    });
}

function LoadAllApplicationList() {
    GeneralLoad();
    InitPaginate("#table_all_application", "LoadAllApplicationList();");

    page = parseInt($('#table_all_application_page_input').val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/application/list?page=" + page + "&application_type=0&all_user=1",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            STATUS = ["Pending", "Accepted", "Declined"];

            applicationList = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < applicationList.length; i++) {
                application = applicationList[i];
                apptype = applicationTypes[application.application_type];
                username = application.creator.name;
                creation = getDateTime(application.submit_timestamp * 1000);
                closedat = getDateTime(application.update_timestamp * 1000);
                if (application.update_timestamp == 0) 
                    closedat = "/";
                status = STATUS[application.status];

                color = "blue";
                if (application.status == 1) color = "lightgreen";
                if (application.status == 2) color = "red";

                data.push([`${application.applicationid}`, `${username}`, `${apptype}`, `${creation}`, `<span style="color:${color}">${status}</span>`, `${closedat}`, `<button type="button" style="display:inline;padding:5px" id="MyAppBtn${application.applicationid}" 
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="GetApplicationDetail(${application.applicationid}, true)">Details</button>`]);
            }

            PushTable("#table_all_application", data, total_pages, "LoadAllApplicationList();");
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function GetApplicationDetail(applicationid, staffmode = false) {
    GeneralLoad();
    LockBtn("#AllAppBtn" + applicationid, "Loading...");
    LockBtn("#MyAppBtn" + applicationid, "Loading...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/application?applicationid=" + applicationid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#AllAppBtn" + applicationid);
            UnlockBtn("#MyAppBtn" + applicationid);
            if (data.error) return AjaxError(data);

            d = data.response.detail;
            discordid = data.response.creator.discordid;
            keys = Object.keys(d);
            if (keys.length == 0)
                return toastNotification("error", "Error", "Application has no data", 5000, false);
                
            apptype = applicationTypes[data.response.application_type];
            ret = "";
            for (i = 0; i < keys.length; i++)
                ret += "<p style='text-align:left'><b>" + keys[i] + ":</b><br> " + d[keys[i]] + "</p><br>";

            $.ajax({
                url: apidomain + "/" + vtcprefix + "/user?discordid=" + String(discordid),
                type: "GET",
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                success: function (data) {
                    info = "";
                    if (!data.error) {
                        d = data.response;
                        info += "<p style='text-align:left'><b>Name:</b> " + d.name + "</p>";
                        info += "<p style='text-align:left'><b>Email:</b> " + d.email + "</p>";
                        info += "<p style='text-align:left'><b>Discord ID:</b> " + discordid + "</p>";
                        info +=
                            "<p style='text-align:left'><b>TruckersMP ID:</b> <a href='https://truckersmp.com/user/" +
                            d.truckersmpid + "'>" + d.truckersmpid + "</a></p>";
                        info +=
                            "<p style='text-align:left'><b>Steam ID:</b> <a href='https://steamcommunity.com/profiles/" +
                            d.steamid + "'>" + d.steamid + "</a></p><br>";
                    }
                    info += ret.replaceAll("\n", "<br>");
                    if (!staffmode) {
                        info += `
                            <hr>
                            <h3 class="text-xl font-bold" style="text-align:left;margin:5px">New message</h3>
                            <div class="mb-6" style="display:none">
                                <label class="block text-sm font-medium mb-2" for="">Application ID</label>
                                <input id="appmsgid" style="width:200px"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded" name="field-name"
                                rows="5" placeholder="Integar ID" value="${applicationid}"></input>
                            </div>
                                <textarea id="appmsgcontent"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded" name="field-name"
                                rows="5" placeholder=""></textarea>
                    
                            <button type="button" id="addAppMessageBtn" style="float:right"
                                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                onclick="AddMessageToApplication()">Add</button>`;
                    } else {
                        info += `
                            <hr>
                            <h3 class="text-xl font-bold" style="text-align:left;margin:5px">New message</h3>
                            <div class="mb-6" style="display:none">
                                <label class="block text-sm font-medium mb-2" for="">Application ID</label>
                                <input id="appstatusid" style="width:200px"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded" name="field-name"
                                rows="5" placeholder="" value="${applicationid}"></input></div>
                    
                            <div class="mb-6">
                                <textarea id="appmessage"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded" name="field-name"
                                rows="5" placeholder=""></textarea></div>
                    
                            <div class="mb-6 relative" style="width:200px">
                            <h3 class="text-xl font-bold" style="text-align:left;margin:5px">New Status</h3>
                                <select id="appstatussel"
                                class="appearance-none block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                name="field-name">
                                <option value="0">Pending</option>
                                <option value="1">Accepted</option>
                                <option value="2">Declined</option>
                                </select>
                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewbox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"></path>
                                </svg>
                                </div>
                            </div>
                    
                            <button type="button" style="float:right"
                                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                onclick="UpdateApplicationStatus()" id="updateAppStatusBtn">Update</button>
                            </div>
                        </div>`;
                    }
                    Swal.fire({
                        title: apptype + ' Application #' + applicationid,
                        html: info,
                        icon: 'info',
                        showConfirmButton: false,
                        confirmButtonText: 'Close'
                    })
                }
            });
        },
        error: function (data) {
            UnlockBtn("#AllAppBtn" + applicationid);
            UnlockBtn("#MyAppBtn" + applicationid);
            AjaxError(data);
        }
    })
}

function UpdateApplicationStatus() {
    GeneralLoad();
    LockBtn("#updateAppStatusBtn");

    appid = $("#appstatusid").val();
    appstatus = parseInt($("#appstatussel").find(":selected").val());
    message = $("#appmessage").val();

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/application/status",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "applicationid": appid,
            "status": appstatus,
            "message": message
        },
        success: function (data) {
            UnlockBtn("#updateAppStatusBtn");
            if (data.error) return AjaxError(data);
            LoadAllApplicationList();
            toastNotification("success", "Success", "Application status updated.", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#updateAppStatusBtn");
            AjaxError(data);
        }
    })
}

function UpdateApplicationPositions() {
    GeneralLoad();
    LockBtn("#updateStaffPositionBtn");
    positions = $("#staffposedit").val().replaceAll("\n", ",");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/application/positions",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "positions": positions
        },
        success: function (data) {
            UnlockBtn("#updateStaffPositionBtn");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success!", "", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#updateStaffPositionBtn");
            AjaxError(data);
        }
    })
}
division_placeholder_row = `
<div class="shadow p-3 m-3 bg-dark rounded col card">
    <h5 class="card-title"><strong><span class="placeholder" style="width:150px"></span></strong></h5>
    <p class="card-text"><span class="rect-20"><i class="fa-solid fa-user-group"></i></span> <span class="placeholder" style="width:100px"></span></p>
    <p class="card-text"><span class="rect-20"><i class="fa-solid fa-coins"></i></span> <span class="placeholder" style="width:120px"></span></p>
</div>`;

division_pending_row = `<tr>
<td style="width:25%;"><span class="placeholder w-100"></span></td>
<td style="width:25%;"><span class="placeholder w-100"></span></td>
<td style="width:50%;"><span class="placeholder w-100"></span></td>
</tr>`;

async function LoadDivisionInfo() {
    $("#division-summary-list").children().remove();
    for(var i=0;i<3;i++){
        $("#division-summary-list").append(division_placeholder_row);
    }
    $("#table_division_delivery_data").empty();
    for(var i=0;i<10;i++){
        $("#table_division_delivery_data").append(dlog_placeholder_row);
    }
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/division",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            d = data.response;

            $("#division-summary-list").children().remove();
            info = d.statistics;
            for (var i = 0; i < info.length; i++) {
                divisionid = info[i].divisionid;
                divisionname = info[i].name;
                totaldrivers = TSeparator(info[i].total_drivers);
                totalpnt = TSeparator(info[i].total_points);
                $("#division-summary-list").append(`
                <div class="shadow p-3 m-3 bg-dark rounded col card">
                    <h5 class="card-title"><strong>${divisionname}</strong></h5>
                    <p class="card-text"><span class="rect-20"><i class="fa-solid fa-user-group"></i></span> ${totaldrivers} Drivers</p>
                    <p class="card-text"><span class="rect-20"><i class="fa-solid fa-coins"></i></span> ${totalpnt} Points</p>
                </div>`);
            }

            $("#table_division_delivery_data").empty();
            if (d.recent_deliveries.length == 0) {
                $("#table_division_delivery_head").hide();
                $("#table_division_delivery_data").append(`<tr><td style="color:#ccc"><i>No Data</i></td>`);
            } else {
                $("#table_division_delivery_head").show();
                for (i = 0; i < d.recent_deliveries.length; i++) {
                    delivery = d.recent_deliveries[i];
                    user = delivery.user;
                    distance = TSeparator(parseInt(delivery.distance * distance_ratio));
                    cargo_mass = parseInt(delivery.cargo_mass / 1000) + "t";
                    unittxt = "€";
                    if (delivery.unit == 2) unittxt = "$";
                    profit = TSeparator(delivery.profit);
                    
                    dextra = "<span title='Validated Division Delivery'>" + SVG_VERIFIED + "</span>";
                    $("#table_division_delivery_data").append(`
            <tr>
              <td><a style='cursor:pointer' onclick="ShowDeliveryDetail('${delivery.logid}')">${delivery.logid} ${dextra}</a></td>
              <td>${GetAvatar(user.userid, user.name, user.discordid, user.avatar)}</td>
              <td>${delivery.source_company}, ${delivery.source_city}</td>
              <td>${delivery.destination_company}, ${delivery.destination_city}</td>
              <td>${distance}${distance_unit_txt}</td>
              <td>${delivery.cargo} (${cargo_mass})</td>
              <td>${unittxt}${profit}</td>
            </tr>`);
                }
            }
        },
        error: function (data) {
            AjaxError(data);
        }
    });
    while(1){
        if(userPermLoaded) break;
        await sleep(100);
    }
    if(userPerm.includes("division") || userPerm.includes("admin")){
        $("#division-pending-list").show();
        LoadPendingDivisionValidation();
    }
}

function GetDivisionInfo(logid) {
    LockBtn("#button-delivery-detail-division", "Checking...");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/division?logid=" + logid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            UnlockBtn("#button-delivery-detail-division");
            if (data.error) return AjaxError(data);

            divisionopt = "";
            for(var i = 0 ; i < Object.keys(divisions).length ; i++) {
                divisionopt += `<option value="${divisions[Object.keys(divisions)[i]].id}" id="division-${divisions[Object.keys(divisions)[i]].id}">${divisions[Object.keys(divisions)[i]].name}</option>`;
            }
            if(divisionopt == "") return $("#delivery-detail-division").html(`<span style="color:red">No division found</span>`);
            
            info = ``;
            if (data.response.status == "-1") {
                info += `
                <select class="form-select bg-dark text-white" id="select-division">
                    <option value="-1" selected>Select Division</option>
                    ${divisionopt}
                </select>`;
                info += `<button id="button-request-division-validation" type="button" class="btn btn-primary"  onclick="SubmitDivisionValidationRequest(${logid});">Request Validation</button>`;
                $("#delivery-detail-division").html(info);
            } else if ((userPerm.includes("division") || userPerm.includes("admin")) && data.response.status == "0") {
                info += `
                <p>This delivery is pending division validation.</p>
                <label for="select-division" class="form-label">Division</label>
                <div class="mb-3">
                    <select class="form-select bg-dark text-white" id="select-division">
                        ${divisionopt}
                    </select>
                </div>
                <label for="validate-division-message" class="form-label">Message</label>
                <div class="input-group mb-3" style="height:100px;">
                    <textarea type="text" class="form-control bg-dark text-white" id="validate-division-message" placeholder="(Optional, a reason should be provided here if you need to reject the request)" style="height:100%"></textarea>
                </div>
                `;
                modalid = ShowModal(`Division Validation`, info, `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button id="button-division-danger" type="button" class="btn btn-danger" style="width:100px;" onclick="UpdateDivision(${logid}, 2);">Reject</button>
                <button id="button-division-accept" type="button" class="btn btn-success" style="width:100px;" onclick="UpdateDivision(${logid}, 1);">Accept</button>`);
                InitModal("division_detail", modalid, top = true);
                $("#division-" + data.response.divisionid).prop("selected", true);
            } else {
                if (data.response.update_message == undefined) {
                    $("#delivery-detail-division").html(divisions[data.response.divisionid].name);
                } else {
                    info += divisions[data.response.divisionid].name + " ";
                    if (data.response.status == "0") info += "| Pending Validation";
                    else if (data.response.status == "1") info += SVG_VERIFIED;
                    else if (data.response.status == "2"){
                        staff = data.response.update_staff;
                        staff = GetAvatar(staff.userid, staff.name, staff.discordid, staff.avatar);
                        info += `| Rejected By ` + staff;
                    }
                }
                if (userPerm.includes("division") || userPerm.includes("admin")) {
                    modalid = ShowModal(`Division Validation`, info, `
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button id="button-division-revalidate" type="button" class="btn btn-primary" style="width:100px;" onclick="UpdateDivision(${logid}, 0);">Revalidate</button>`);
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
    if(divisionid == "-1") return toastNotification("error", "Error", "Invalid division.", 5000, false);

    LockBtn("#button-request-division-validation", "Requesting...");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/division",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            logid: logid,
            divisionid: divisionid
        },
        success: async function (data) {
            UnlockBtn("#button-request-division-validation");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", "Request submitted!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-request-division-validation");
            AjaxError(data);
        }
    });
}

function LoadPendingDivisionValidation() {
    $("#table_division_pending_data").empty();
    for(var i = 0 ; i < 5 ; i++){
        $("#table_division_pending_data").append(division_pending_row);
    }
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/division/list/pending",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            $("#table_division_pending_data").empty();
            d = data.response;
            if (d.length == 0) {
                $("#table_division_pending_head").hide();
                $("#table_division_pending_data").append(`<tr><td style="color:#ccc"><i>No Data</i></td>`);
            } else {
                $("#table_division_pending_head").show();
                for (i = 0; i < d.length; i++) {
                    delivery = d[i];
                    user = delivery.user;
                    $("#table_division_pending_data").append(`
                        <tr>
                        <td><a onclick="ShowDeliveryDetail(${delivery.logid})" style="cursor:pointer">${delivery.logid}</a></td>
                        <td>${divisions[delivery.divisionid].name}</td>
                        <td>${GetAvatar(user.userid, user.name, user.discordid, user.avatar)}</td>
                    </tr>`);
                }
            }
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function UpdateDivision(logid, status) {
    divisionid = "-1";
    if(status >= 1){
        divisionid = $("#select-division").find(":selected").val();
        if(divisionid == "-1") return toastNotification("error", "Error", "Invalid division.", 5000, false);
    }

    if (status == 1) {
        LockBtn("#button-division-accept", "Accepting...");
        $("#button-division-reject").attr("disabled", "disabled");
    } else if (status == 2) {
        LockBtn("#button-division-reject", "Rejecting...");
        $("#button-division-accept").attr("disabled", "disabled");
    } else if(status == 0){
        LockBtn("#button-division-revalidate", "Requesting...");
    }

    message = $("#validate-division-message").val();
    if (message == undefined || message == null) message = "";

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/division",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            logid: logid,
            divisionid: divisionid,
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
            } else if(status == 0){
                UnlockBtn("#button-division-revalidate");
            }
            if (data.error) return AjaxError(data);
            GetDivisionInfo(logid);
            if (status == 1) {
                toastNotification("success", "Success", "Division delivery accepted!", 5000, false);
            } else if (status == 2) {
                toastNotification("success", "Success", "Division delivery rejected!", 5000, false);
            } else if(status == 0){
                toastNotification("success", "Success", "Division delivery validation status updated to pending!", 5000, false);
            }
        },
        error: function (data) {
            if (status == 1) {
                UnlockBtn("#button-division-accept");
                $("#button-division-reject").removeAttr("disabled");
            } else if (status == 2) {
                UnlockBtn("#button-division-reject");
                $("#button-division-accept").removeAttr("disabled");
            } else if(status == 0){
                UnlockBtn("#button-division-revalidate");
            }
            AjaxError(data);
        }
    });
}

async function LoadDownloads() {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/downloads",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            $("#downloads-content").html(parseMarkdown(data.response));
            $("#downloads-edit-content").val(data.response);
        },
        error: function (data) {
            AjaxError(data);
        }
    });

    while(1){
        if(userPermLoaded) break;
        await sleep(100);
    }
    if(userPerm.includes("downloads") || userPerm.includes("admin")){
        $("#downloads-edit-button-wrapper").show();
        $("#downloads-edit-content").on("input", function(){
            $("#downloads-content").html(parseMarkdown($("#downloads-edit-content").val()));
            $("#downloads-unsaved").show();
        });
    }
}

function UpdateDownloads() {
    LockBtn("#button-downloads-edit-save", "Saving...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/downloads",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "data": $("#downloads-edit-content").val()
        },
        success: function (data) {
            UnlockBtn("#button-downloads-edit-save");
            $("#downloads-unsaved").hide();
            if (data.error) return AjaxError(data);
            $("#downloads-content").html(parseMarkdown($("#downloads-edit-content").val()));
            toastNotification("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-downloads-edit-save");
            AjaxError(data);
        }
    })
}
allevents = {};

event_placerholder_row = `
<tr>
    <td style="width:100px"><span class="placeholder w-100"></span></td>
    <td style="width:calc(100% - 580px - 40%);"><span class="placeholder w-100"></span></td>
    <td style="width:calc(100% - 580px - 25%);"><span class="placeholder w-100"></span></td>
    <td style="width:calc(100% - 580px - 25%);"><span class="placeholder w-100"></span></td>
    <td style="width:120px;"><span class="placeholder w-100"></span></td>
    <td style="width:180px;"><span class="placeholder w-100"></span></td>
    <td style="width:180px;"><span class="placeholder w-100"></span></td>
    <td style="width:calc(100% - 580px - 10%);"><span class="placeholder w-100"></span></td>
</tr>`;

async function LoadEvent(noplaceholder = false) {
    if (eventsCalendar == undefined || force) {
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/event/all",
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
                        "start": new Date(d[i].meetup_timestamp * 1000 - offset).toISOString().substring(0, 10)
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
    if(userPerm.includes("event") || userPerm.includes("admin")){
        $("#event-new").show();
    }
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/event?page=" + page,
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

                data.push([`<tr_style>${style}</tr_style>`, `<a class="clickable" onclick="ShowEventDetail('${event.eventid}')">${event.eventid} ${pvt}</a>`, `<a class="clickable" onclick="ShowEventDetail('${event.eventid}')">${event.title}</a>`, `${event.departure}`, `${event.destination}`, `${event.distance}`, `${mt.replaceAll(",",",<br>")}`, `${dt.replaceAll(",",",<br>")}`, `${votecnt}`, extra]);
            }

            PushTable("#table_event_list", data, total_pages, "LoadEvent();");
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

async function ShowEventDetail(eventid, reload = false) {
    if (Object.keys(allevents).indexOf(String(eventid)) == -1 || reload) {
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/event?eventid=" + eventid,
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                if (data.error) return AjaxError(data);
                allevents[eventid] = data.response;
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
    info += GenTableRow("Meetup", getDateTime(event.meetup_timestamp * 1000));
    info += GenTableRow("Departure", getDateTime(event.departure_timestamp * 1000));
    if(userid != null && userid != -1){
        info += GenTableRow("Points", parseInt(event.points));
        info += GenTableRow(`Voters ${voteop}`, vote);
        info += GenTableRow(`Attendees ${attendeeop}`, attendee);
    }

    info += "</tbody></table>"
    info += "<div class='w-100 mt-2' style='overflow:scroll'><p>" + parseMarkdown(event.description).replaceAll("<img","<img style='width:100%' ") + "</p></div>";
    modalid = ShowModal("Event #" + event.eventid, info);
    InitModal("event_detail", modalid);
}

function VoteEvent(eventid, resp) {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/event/vote?eventid=" + eventid,
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
    description = $("#event-new-description").val();
    truckersmp_link = $("#event-new-truckersmp-link").val();
    departure = $("#event-new-departure").val();
    destination = $("#event-new-destination").val();
    distance = $("#event-new-distance").val();
    meetup_timestamp = +new Date($("#event-new-meetup-time").val())/1000;
    departure_timestamp = +new Date($("#event-new-departure-time").val())/1000;
    is_private = $("#event-visibility-private").is(":checked");

    LockBtn("#button-event-new-create", "Creating...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/event",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "title": title,
            "description": description,
            "truckersmp_link": truckersmp_link,
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
            toastNotification("success", "Success", "Event created!", 5000, false);
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
    truckersmp_link = e.truckersmp_link;
    departure = e.departure;
    destination = e.destination;
    distance = e.distance;
    meetup_timestamp = e.meetup_timestamp;
    departure_timestamp = e.departure_timestamp;
    is_private = e.is_private;
    $("#event-edit-id-span").html(eventid);
    $("#event-edit-id").val(eventid);
    $("#event-edit-title").val(title);
    $("#event-edit-description").val(description);
    $("#event-edit-truckersmp-link").val(truckersmp_link);
    $("#event-edit-departure").val(departure);
    $("#event-edit-destination").val(destination);
    $("#event-edit-distance").val(distance);
    $("#event-edit-meetup-time").val(new Date(parseInt(meetup_timestamp)*1000).toISOString().slice(0,-1));
    $("#event-edit-departure-time").val(new Date(parseInt(departure_timestamp)*1000).toISOString().slice(0,-1));
    if(is_private) $("#event-edit-visibility-private").prop("checked", true);
    else $("#event-edit-visibility-public").prop("checked", true);
    $("#event-edit").show();
}

function EditEvent(){
    LockBtn("#button-event-edit", "Editing...");
    eventid = $("#event-edit-id").val();
    title = $("#event-edit-title").val();
    description = $("#event-edit-description").val();
    truckersmp_link = $("#event-edit-truckersmp-link").val();
    departure = $("#event-edit-departure").val();
    destination = $("#event-edit-destination").val();
    distance = $("#event-edit-distance").val();
    meetup_timestamp = +new Date($("#event-edit-meetup-time").val())/1000;
    departure_timestamp = +new Date($("#event-edit-departure-time").val())/1000;
    is_private = $("#event-edit-visibility-private").is(":checked");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/event?eventid="+eventid,
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "title": title,
            "description": description,
            "truckersmp_link": truckersmp_link,
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
            toastNotification("success", "Success", "Event created!", 5000, false);
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
    modalid = ShowModal("Delete Event", `<p>Are you sure you want to delete this event?</p><p><i>${title}</i></p><br><p style="color:#aaa"><span style="color:lightgreen"><b>PROTIP:</b></span><br>You can hold down shift when clicking delete button to bypass this confirmation entirely.</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button id="button-event-delete-${eventid}" type="button" class="btn btn-danger" onclick="DeleteEvent(${eventid});">Delete</button>`);
    InitModal("delete_event", modalid);
}

function DeleteEvent(eventid){
    LockBtn("#button-event-delete-"+eventid, "Deleting...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/event?eventid=" + eventid,
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            UnlockBtn("#button-event-delete-"+eventid);
            if (data.error) AjaxError(data);
            LoadEvent(noplaceholder = true);
            toastNotification("success", "Success", "Event deleted!", 5000, false);
            if(Object.keys(modals).includes("delete_event")) DestroyModal("delete_event");
        },
        error: function (data) {
            UnlockBtn("#button-event-delete-"+eventid);
            AjaxError(data);
        }
    });
}

function EditAttendeeShow(eventid){
    modalid = ShowModal("Edit Event Point & Attendee", `
    <p>#${eventid} | ${allevents[eventid].title}</p>
    <label for="event-edit-point" class="form-label">Event Point</label>
    <div class="input-group mb-3">
        <input type="number" class="form-control bg-dark text-white" id="event-edit-point" placeholder="3000">
    </div>
    <label for="event-edit-attendee" class="form-label">Attendees</label>
    <div class="input-group mb-3">
        <input type='text' id="event-edit-attendee" placeholder='Select members from list' class="form-control bg-dark text-white flexdatalist" list="all-member-datalist" data-min-length='1' multiple='' data-selection-required='1'></input>
    </div>
    <p id="event-edit-message"></p>`, 
    `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
    <button id="button-event-edit-attendee" type="button" class="btn btn-primary" onclick="EditEventAttendee(${eventid});">Edit</button>`);
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
        return toastNotification("error", "Error", "Invalid event point!", 5000);
    }
    attendeestxt = $("#event-edit-attendee").val();
    attendeest = attendeestxt.split(",");
    attendees = [];
    for(var i = 0 ; i < attendeest.length ; i++){
        s = attendeest[i];
        attendees.push(s.substr(s.lastIndexOf("(")+1,s.lastIndexOf(")")-s.lastIndexOf("(")-1));
    }
    attendees = attendees.join(",");

    LockBtn("#button-event-edit-attendee", "Editing...");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/event/attendee?eventid=" + eventid,
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
            $("#event-edit-message").html("<br>" + data.response.message.replaceAll("\n","<br>"));
            toastNotification("success", "Sucess", "Event point & attendee updated!", 5000);
        },
        error: function (data) {
            UnlockBtn("#button-event-edit-attendee");
            AjaxError(data);
        }
    })
}
function LoginValidate() {
    token = localStorage.getItem("token");
    if (token == undefined) {
        return;
    }
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            if (data.error == false) {
                localStorage.setItem("token", token);
                if (data.response.truckersmpid > 0 && data.response.steamid > 0) {
                    window.location.href = "/";
                } else {
                    window.location.href = "/auth?token=" + token;
                }
            }
        }
    });
}

function SteamValidate() {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/steam",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "callback": sPageURL
        },
        success: function (data) {
            if (data.error == false) {
                window.location.href = "/";
            } else {
                $("#msg").html(data.descriptor);
                $("#steamauth").show();
            }
        },
        error: function (data) {
            $("#msg").html(data.descriptor);
            $("#steamauth").show();
        }
    });
}

var CaptchaCallback = function(hcaptcha_response){
    email = $("#signin-email").val();
    password = $("#signin-password").val();
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/auth/password",
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
                if(mfa){
                    localStorage.setItem("tip", token);
                    localStorage.setItem("pending-mfa", +new Date());
                    ShowTab("#mfa-tab");
                    setTimeout(function(){$("#mfa-otp").on("input", function(){
                        if($("#mfa-otp").val().length == 6){
                            MFAVerify();
                        }
                    });},50);
                } else {
                    localStorage.setItem("token", token);
                    ValidateToken();
                    $(".tabs").removeClass("loaded");
                    toastNotification("success", "Success", "Welcome back!", 5000);
                    setTimeout(function(){ShowTab("#overview-tab");},1000);
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
        return toastNotification("warning", "", "Enter email and password.", 3000, false);
    }
    LockBtn("#button-signin", `<span class="rect-20"><i class="fa-solid fa-right-to-bracket"></i></span> Logging in`);
    requireCaptcha = true;
    setTimeout(function(){UnlockBtn("#button-signin");setTimeout(function(){ShowTab("#captcha-tab");},500);},1000);
}

function MFAVerify(){
    LockBtn("#button-mfa-verify", "Verifying...");
    otp = $("#mfa-otp").val();
    token = localStorage.getItem("tip");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/auth/mfa",
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
            if (data.error == true) AjaxError(data);
            newtoken = data.response.token;
            localStorage.setItem("token", newtoken);
            localStorage.removeItem("tip");
            localStorage.removeItem("pending-mfa");
            $(".tabs").removeClass("loaded");
            ValidateToken();
            toastNotification("success", "Success", "Welcome back!", 5000);
            setTimeout(function(){ShowTab("#overview-tab");},1000);
        },
        error: function (data) {
            UnlockBtn("#button-mfa-verify");
            AjaxError(data);
        }
    });
}

function AuthValidate() {
    message = getUrlParameter("message");
    if (message) {
        $("#title").html("Error");
        $("#msg").html(message.replaceAll("+", " "));
        $("#msg").show();
        $("#loginbtn").show();
        return;
    }
    token = getUrlParameter("token");
    mfa = getUrlParameter("mfa");
    if(mfa){
        setTimeout(function(){
            otp = prompt("Please enter OTP for MFA:");
            $.ajax({
                url: apidomain + "/" + vtcprefix + "/auth/mfa",
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
                    if (data.error == false) {
                        newtoken = data.response.token;
                        localStorage.setItem("token", newtoken);
                        window.location.href = "/auth";
                    } else {
                        $("#msg").html("Invalid token, please retry.");
                        $("#loginbtn").show();
                    }
                },
                error: function (data) {
                    $("#msg").html("Invalid token, please retry.");
                    $("#loginbtn").show();
                }
            });
        }, 500);
        return;
    }
    if (token) {
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/token",
            type: "PATCH",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                if (data.error == false) {
                    newtoken = data.response.token;
                    localStorage.setItem("token", newtoken);
                    window.location.href = "/auth";
                } else {
                    $("#msg").html("Invalid token, please retry.");
                    $("#loginbtn").show();
                }
            },
            error: function (data) {
                $("#msg").html("Invalid token, please retry.");
                $("#loginbtn").show();
            }
        });
    } else {
        token = localStorage.getItem("token");
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/user",
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                if (data.error == false) {
                    if (data.response.truckersmpid > 0 && data.response.steamid > 0) {
                        window.location.href = "/";
                        $("#msg").html("You are being redirected to Drivers Hub.");
                    } else if (data.response.steamid <= 0) {
                        $("#title").html("Steam Connection<br>");
                        $("#title").css("font-size", "1.5em");
                        $("#msg").html(
                            "Connect to steam account to: <br><br> - Auto-connect TruckersMP account <br> - Auto-join Navio company"
                        );
                        $("#connect_steam").show();
                    } else if (data.response.truckersmpid <= 0) {
                        $("#title").html("TruckersMP Connection");
                        $("#title").css("font-size", "1.5em");
                        $("#msg").html(
                            "Enter TruckersMP User ID <br> (We'll check if it's connected to your Steam account)"
                        );
                        $("#connect_truckersmp").show();
                    }
                } else {
                    $("#msg").html("Invalid token, please retry.");
                    $("#loginbtn").show();
                }
            },
            error: function (data) {
                $("#msg").html("Invalid token, please retry.");
                $("#loginbtn").show();
            }
        });
    }
}

function TMPBind() {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/truckersmp",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "truckersmpid": $("#truckersmpid").val()
        },
        success: function (data) {
            if (data.error == false) {
                $("#title").html("TruckersMP Connected");
                $("#msg").html("You are being redirected to Drivers Hub.");
                window.location.href = "/";
            } else {
                return toastNotification("error", "Error", data.descriptor, 5000, false);
            }
        },
        error: function (data) {
            return toastNotification("error", "Error", data.descriptor, 5000, false);
        }
    });
}
SVG_VERIFIED = `<svg style="display:inline;position:relative;top:-1.5px;color:skyblue" width="18" height="18" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M10.5213 2.62368C11.3147 1.75255 12.6853 1.75255 13.4787 2.62368L14.4989 3.74391C14.8998 4.18418 15.4761 4.42288 16.071 4.39508L17.5845 4.32435C18.7614 4.26934 19.7307 5.23857 19.6757 6.41554L19.6049 7.92905C19.5771 8.52388 19.8158 9.10016 20.2561 9.50111L21.3763 10.5213C22.2475 11.3147 22.2475 12.6853 21.3763 13.4787L20.2561 14.4989C19.8158 14.8998 19.5771 15.4761 19.6049 16.071L19.6757 17.5845C19.7307 18.7614 18.7614 19.7307 17.5845 19.6757L16.071 19.6049C15.4761 19.5771 14.8998 19.8158 14.4989 20.2561L13.4787 21.3763C12.6853 22.2475 11.3147 22.2475 10.5213 21.3763L9.50111 20.2561C9.10016 19.8158 8.52388 19.5771 7.92905 19.6049L6.41553 19.6757C5.23857 19.7307 4.26934 18.7614 4.32435 17.5845L4.39508 16.071C4.42288 15.4761 4.18418 14.8998 3.74391 14.4989L2.62368 13.4787C1.75255 12.6853 1.75255 11.3147 2.62368 10.5213L3.74391 9.50111C4.18418 9.10016 4.42288 8.52388 4.39508 7.92905L4.32435 6.41553C4.26934 5.23857 5.23857 4.26934 6.41554 4.32435L7.92905 4.39508C8.52388 4.42288 9.10016 4.18418 9.50111 3.74391L10.5213 2.62368Z" stroke="currentColor" stroke-width="1.5"/> <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/> </svg> `;
SVG_LOCKED = `<svg style="display:inline;position:relative;top:-1.5px;color:red" xmlns="http://www.w3.org/2000/svg" width="18" height="18" enable-background="new 0 0 24 24" viewBox="0 0 24 24"><path d="M17,9V7c0-2.8-2.2-5-5-5S7,4.2,7,7v2c-1.7,0-3,1.3-3,3v7c0,1.7,1.3,3,3,3h10c1.7,0,3-1.3,3-3v-7C20,10.3,18.7,9,17,9z M9,7c0-1.7,1.3-3,3-3s3,1.3,3,3v2H9V7z M13,17c0,0.6-0.4,1-1,1s-1-0.4-1-1v-3c0-0.6,0.4-1,1-1s1,0.4,1,1V17z" fill="red"/></svg>`;

userid = localStorage.getItem("userid");
token = localStorage.getItem("token");
isAdmin = false;
highestrole = 99999;
roles = JSON.parse(localStorage.getItem("roles"));
rolelist = JSON.parse(localStorage.getItem("rolelist"));
perms = JSON.parse(localStorage.getItem("perms"));
positions = JSON.parse(localStorage.getItem("positions"));
divisions = JSON.parse(localStorage.getItem("divisions"));
applicationTypes = JSON.parse(localStorage.getItem("applicationTypes"));
isdark = parseInt(localStorage.getItem("darkmode"));
Chart.defaults.color = "white";
shiftdown = false;
modals = {};
modalName2ID = {};

function Logout(){
    token = localStorage.getItem("token")
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/token",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            localStorage.removeItem("token");
            $("#button-user-profile").attr("onclick",`ShowTab("#signin-tab", "#button-signin-tab");`);
            $("#button-user-profile").attr("data-bs-toggle", "");
            $("#sidebar-username").html("Guest");
            $("#sidebar-userid").html("Login First");
            $("#sidebar-role").html("Loner");
            $("#sidebar-avatar").attr("src","https://cdn.discordapp.com/avatars/873178118213472286/a_cb5bf8235227e32543d0aa1b516d8cab.gif");
            $("#sidebar-application").hide();
            $("#sidebar-staff").hide();
            NonMemberMode();
            ShowTab("#signin-tab", "#button-signin-tab");
        }
    });
}

function InitRankingDisplay(){
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

function InitResizeHandler(){
    setInterval(function () {
        if ($("#overview-tab").width() / 3 <= 300) {
            if ($("#overview-tab").width() / 2 <= 300) $(".statscard").css("width", "100%");
            else $(".statscard").css("width", "50%");
        } else $(".statscard").css("width", "33%");
    }, 10);
}

function InitPhoneView(){
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

function InitInputHandler(){
    $('#searchname').keydown(function (e) {
        if (e.which == 13) LoadMemberList();
    });
    $('#dend,#dspeedlimit').keydown(function (e) {
        if (e.which == 13) LoadDeliveryList();
    });
    $('#udend,#udspeedlimit').keydown(function (e) {
        if (e.which == 13) LoadUserDeliveryList();
    });
    $('#lbend,#lbspeedlimit').keydown(function (e) {
        if (e.which == 13) LoadLeaderboard();
    });
    $('#memberroleid').keydown(function (e) {
        if (e.which == 13) GetMemberRoles();
    });
    $('#appselect').on('change', function () {
        var value = $(this).val();
        $(".apptabs").hide();
        $("#Application" + value).show();
        $("#submitAppBttn").show();
    });
    $('#application4Answer1').on('change', function () {
        var value = $(this).val();
        $(".divisiontabs").hide();
        $("#division-tab" + value).show();
    });
}

function InitDistanceUnit() {
    distance_unit = localStorage.getItem("distance_unit");
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
    }
}

function InitLeaderboardTimeRange(){
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    offset = (+new Date().getTimezoneOffset()) * 60 * 1000;
    firstDay = new Date(+firstDay - offset);
    date = new Date(+date - offset);
    $("#lbstart").val(firstDay.toISOString().substring(0, 10));
    $("#lbend").val(date.toISOString().substring(0, 10));
}

function InitDarkMode(){
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

function InitSearchByName(){
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/list/all",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return;
            l = data.response.list;
            for (var i = 0; i < l.length; i++) {
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
    if(tabname == "#user-delivery-tab"){
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
        window.history.pushState("", "", '/member/' + userid);
        $("#UserBanner").show();
        $("#UserBanner").attr("src", "https://" + window.location.hostname + "/banner/" + userid);
        $("#UserBanner").attr("onclick", `CopyBannerURL("${userid}");`)
        $("#UserBanner").attr("oncontextmenu", `CopyBannerURL("${userid}");`)
        LoadUserProfile(userid);
    }
    if (tabname == "#overview-tab") {
        window.history.pushState("", "", '/yAFgHRTt');
        if(!loaded) LoadStats();
    }
    if (tabname == "#signin-tab") {
        if(localStorage.getItem("token") != null && localStorage.getItem("token").length == 36){
            ShowTab("#overview-tab", "#button-overview-tab");
            return;
        }
        $("#button-user-profile").attr("onclick",`ShowTab("#signin-tab", "#button-signin-tab");`);
        window.history.pushState("", "", '/login');
        $("#signin-email").keypress(function (e) {
            var key = e.which;
            if (key == 13) {
                if ($("#signin-password").val() == "") {
                    $("#signin-password").focus();
                } else {
                    ShowCaptcha();
                }
            }
        });
        $("#signin-password").keypress(function (e) {
            var key = e.which;
            if (key == 13) {
                ShowCaptcha();
            }
        });
    }
    if (tabname == "#captcha-tab"){
        if(!requireCaptcha){
            ShowTab("#overview-tab", "#button-overview-tab");
            return;
        }
        $("#button-user-profile").attr("onclick",`ShowTab("#captcha-tab", "#button-captcha-tab");`);
        window.history.pushState("", "", '/captcha');
    }
    if (tabname == "#mfa-tab"){
        pmfa = localStorage.getItem("pending-mfa");
        if(pmfa == null || (+new Date() - parseInt(pmfa)) > 600000){
            ShowTab("#overview-tab", "#button-overview-tab");
            return;
        }
        window.history.pushState("", "", '/mfa');
    }
    if (tabname == "#announcement-tab") {
        window.history.pushState("", "", '/announcement');
        if(!loaded) LoadAnnouncement();
    }
    if (tabname == "#downloads-tab") {
        window.history.pushState("", "", '/downloads');
        if(!loaded) LoadDownloads();
    }
    if (tabname == "#submit-application-tab") {
        window.history.pushState("", "", '/application/submit');
        $("#driverappsel").attr("selected", "selected");
    }
    if (tabname == "#my-application-tab") {
        window.history.pushState("", "", '/application/my');
        LoadUserApplicationList();
    }
    if (tabname == "#button-staff-application") {
        window.history.pushState("", "", '/application/all');
        LoadAllApplicationList();
    }
    if (tabname == "#staff-user-tab") {
        window.history.pushState("", "", '/staff/user');
        LoadUserList();
    }
    if (tabname == "#member-tab") {
        window.history.pushState("", "", '/member');
        if(!loaded){
            $("#input-member-search").on("keydown", function(e){
                if(e.which == 13){
                    LoadMemberList(noplaceholder = true);
                }
            });
            LoadXOfTheMonth();
            LoadMemberList();
        }
    }
    if (tabname == "#staff-member-tab") {
        window.history.pushState("", "", '/staff/member');
        LoadMemberList();
    }
    if (tabname == "#delivery-tab") {
        window.history.pushState("", "", '/delivery');
        $("#delivery-log-userid").val("");
        $("#company-statistics").show();
        $("#user-statistics").hide();
        if(!loaded){
            LoadDriverLeaderStatistics();
            LoadStats(true);
        }
        $("#delivery-tab").removeClass("last-load-user");
        if(!$("#delivery-tab").hasClass("last-load-company")){
            LoadDeliveryList();
        }
        $("#delivery-tab").addClass("last-load-company");
    }
    if (tabname == "#user-delivery-tab") {
        window.history.pushState("", "", '/member/'+userid+'/delivery');
        $("#company-statistics").hide();
        $("#user-statistics").show();
        $("#delivery-tab").removeClass("last-load-company");
        if(!$("#delivery-tab").hasClass("last-load-user")){
            LoadDeliveryList();
        }
        $("#delivery-tab").addClass("last-load-user");
    }
    if (tabname == "#leaderboard-tab") {
        window.history.pushState("", "", '/leaderboard');
        LoadLeaderboard();
    }
    if (tabname == "#ranking-tab") {
        window.history.pushState("", "", '/ranking');
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/dlog/leaderboard?point_types=distance,event,division,myth&userids=" + userid,
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                if (data.error == false) {
                    d = data.response.list[0];
                    rank = point2rank(d.points.total_no_limit);
                    $("#ranktotpoints").html(TSeparator(d.points.total_no_limit) + " - " + rank);
                    if ($("#sidebar-role").html() == "Driver")
                        $("#sidebar-role").html(rank);
                }
            }
        });
    }
    if (tabname == "#division-tab") {
        window.history.pushState("", "", '/division');
        if(!loaded) LoadDivisionInfo();
    }
    if (tabname == "#event-tab") {
        window.history.pushState("", "", '/event');
        if(!loaded) LoadEvent();
    }
    if (tabname == "#staff-event-tab") {
        window.history.pushState("", "", '/staff/event');
        setTimeout(function(){HandleAttendeeInput();},2000);
        LoadEvent();
    }
    if (tabname == "#audit-tab") {
        window.history.pushState("", "", '/audit');
        LoadAuditLog();
    }
    if (tabname == "#config-tab") {
        window.history.pushState("", "", '/admin');
        loadAdmin();
    }
}

function UpdateRolesOnDisplay(){
    rolestxt = [];
    for (i = 0; i < roles.length; i++) {
        rolestxt.push(rolelist[roles[i]]);
    }
    hrole = rolestxt[0];
    localStorage.setItem("highestrole", hrole);

    if (hrole == undefined || hrole == "undefined") hrole = "Loner";
    $("#sidebar-role").html(hrole);
    roleids = Object.keys(rolelist);
    for (var i = 0; i < roleids.length; i++) {
        roleids[i] = parseInt(roleids[i]);
    }
    userPerm = GetUserPermission();
    ShowStaffTabs();  
}

function LoadCache(){
    rolelist = JSON.parse(localStorage.getItem("rolelist"));
    perms = JSON.parse(localStorage.getItem("perms"));
    positions = JSON.parse(localStorage.getItem("positions"));
    applicationTypes = JSON.parse(localStorage.getItem("applicationTypes"));
    
    if (positions != undefined && positions != null) {
        positionstxt = "";
        for (var i = 0; i < positions.length; i++) {
            positionstxt += positions[i] + "\n";
            $("#sa-select").append("<option value='" + positions[i].replaceAll("'", "\\'") + "'>" + positions[i] + "</option>");
        }
        positionstxt = positionstxt.slice(0, -1);
        $("#staffposedit").val(positionstxt);
    } else {
        positions = [];
    }

    cacheExpire = parseInt(localStorage.getItem("cacheExpire"));
    if(!(rolelist != undefined && perms.admin != undefined && positions != undefined && applicationTypes != undefined))
        cacheExpire = 0;
    if (!isNumber(cacheExpire)) cacheExpire = 0;
    if (cacheExpire <= +new Date()) {
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/application/positions",
            type: "GET",
            dataType: "json",
            success: function (data) {
                positions = data.response;
                localStorage.setItem("positions", JSON.stringify(positions));
            }
        });
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/member/roles",
            type: "GET",
            dataType: "json",
            success: function (data) {
                roles = data.response;
                rolelist = {};
                for(var i = 0 ; i < roles.length ; i++){
                    rolelist[roles[i].id] = roles[i].name;
                }
                localStorage.setItem("rolelist", JSON.stringify(rolelist));
            }
        });
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/application/types",
            type: "GET",
            dataType: "json",
            success: function (data) {
                d = data.response;
                applicationTypes = {};
                for(var i = 0 ; i < d.length ; i++)
                    applicationTypes[parseInt(d[i].applicationid)] = d[i].name;
                localStorage.setItem("applicationTypes", JSON.stringify(applicationTypes));
            }
        });
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/member/perms",
            type: "GET",
            dataType: "json",
            success: function (data) {
                perms = data.response;
                localStorage.setItem("perms", JSON.stringify(perms));
            }
        });
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/division/list",
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                d = data.response;
                divisions = {};
                for(i=0;i<d.length;i++){
                    divisions[d[i].id] = d[i];
                }
                localStorage.setItem("divisions", JSON.stringify(divisions));
            }
        });
        localStorage.setItem("cacheExpire", +new Date() + 86400000);
    }
}

userPerm = [];
userPermLoaded = false;
function GetUserPermission(){
    if(roles == undefined || perms.admin == undefined) return;
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
    return userPerm;
}

function ShowStaffTabs() {
    t = JSON.parse(JSON.stringify(userPerm));
    t.pop("user");
    t.pop("driver");
    if (t.length > 0) {
        $("#sidebar-staff").show();
        $("#sidebar-staff a").hide();
        if (userPerm.includes("admin")) {
            $("#sidebar-staff a").show();
            $(".admin-only").show();
            $("#button-config-tab").show();
        } else {
            $(".admin-only").hide();
            if (userPerm.includes("hr") || userPerm.includes("division")) {
                $("#button-staff-member-tab").show();
                $("#button-staff-application-tab").show();
            }
            if (userPerm.includes("hr")) {
                $("#button-staff-user").show();
            }
            if (userPerm.includes("audit")) {
                $("#button-audit-tab").show();
            }
        }
    }
}

function NonMemberMode(){
    $("#sidebar-role").html("Loner");
    $("#overview-right-col").hide();
    $("#overview-left-col").removeClass("col-8");
    $("#overview-left-col").addClass("col");
    $(".member-only-tab").hide();
}

function MemberMode(){
    $("#overview-right-col").show();
    $("#overview-left-col").addClass("col-8");
    $("#overview-left-col").removeClass("col");
    $(".member-only-tab").show();
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
        $("#sidebar-username").html("Guest");
        $("#sidebar-userid").html("Login First");
        $("#button-user-profile").attr("onclick",`ShowTab("#signin-tab", "#button-signin-tab");`);
        $("#button-user-profile").attr("data-bs-toggle", "");
        NonMemberMode();
        userPermLoaded = true;
        return;
    }

    $("#sidebar-application").show();
    $("#sidebar-username").html(`<span class="placeholder col-8"></span>`);
    $("#sidebar-userid").html(`<span class="placeholder col-2"></span>`);
    $("#sidebar-role").html(`<span class="placeholder col-6"></span>`);
    $("#button-user-profile").attr("onclick",``);
    $("#button-user-profile").attr("data-bs-toggle", "dropdown");

    if(userid != -1 && userid != null){
        MemberMode();
        $("#sidebar-banner").show();
    } else {
        NonMemberMode();
    }
    
    // Validate token and get user information
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user",
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
            localStorage.setItem("roles", JSON.stringify(data.response.roles));
            localStorage.setItem("name", data.response.name);
            localStorage.setItem("avatar", data.response.avatar);
            localStorage.setItem("discordid", data.response.discordid);
            localStorage.setItem("userid", data.response.userid);

            userid = data.response.userid;

            if (userid != -1 && userid != null) {
                // Logged in, and is member, show membersOnlyTabs
                MemberMode();
                $("#sidebar-banner").show();
            } else {
                // Logged in, not member, hide division and downloads
                NonMemberMode();
            }

            // Check if is member
            userid = data.response.userid;
            if (data.response.userid != -1) {
                $("#button-member-tab").show();
            }
            roles = data.response.roles.sort(function (a, b) {
                return a - b
            });
            highestrole = roles[0];
            highestroleid = roles[0];
            name = data.response.name;
            avatar = data.response.avatar;
            discordid = data.response.discordid;
            $("#sidebar-username").html(name);
            $("#sidebar-userid").html("#" + userid);
            $("#sidebar-bio").html(data.response.bio);
            $("#sidebar-banner").attr("src", "https://drivershub.charlws.com/" + vtcprefix + "/member/banner?userid=" + userid);
            if (avatar.startsWith("a_"))
                $("#sidebar-avatar").attr("src", "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif");
            else
                $("#sidebar-avatar").attr("src", "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png");
            
            UpdateRolesOnDisplay();

            if(!userPerm.includes("driver") && !userPerm.includes("admin")){
                $("#sidebar-userid").html("##");
                NonMemberMode();
            }
        }, error: function(data){
            // Invalid token, log out
            if(parseInt(data.status) == 401){ // Prevent connection issue (e.g. refresh)
                localStorage.removeItem("token");
                ShowTab("#signin-tab", "#button-signin-tab");
            }
        }
    });
}

function PathDetect() {
    p = window.location.pathname;
    if (p == "/overview") window.history.pushState("", "", '/yAFgHRTt');
    else if (p == "/") ShowTab("#overview-tab", "#button-overview-tab");
    else if (p == "/login") ShowTab("#signin-tab", "#button-signin-tab");
    else if (p == "/captcha") ShowTab("#captcha-tab", "#button-captcha-tab");
    else if (p == "/mfa") ShowTab("#mfa-tab", "#button-mfa-tab");
    else if (p == "/announcement") ShowTab("#announcement-tab", "#button-announcement-tab");
    else if (p == "/downloads") ShowTab("#downloads-tab", "#button-downloads-tab");
    else if (p == "/map") ShowTab("#map-tab", "#button-map-tab");
    else if (p.startsWith("/delivery")) {
        if(getUrlParameter("logid")){
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
    } else if (p == "/division") ShowTab("#division-tab", "#button-division-tab");
    else if (p == "/event") ShowTab("#event-tab", "#button-event-tab");
    else if (p == "/staff/event") ShowTab("#staff-event-tab", "#button-staff-event-tab");
    else if (p.startsWith("/member")) {
        if(p.endsWith("/delivery")){
            if (p.split("/").length >= 3){
                $('#delivery-log-userid').val(parseInt(p.split("/")[2]));
                ShowTab("#user-delivery-tab", "#button-user-delivery-tab")
            } else {
                ShowTab("#delivery-tab", "#button-delivery-tab");
            }
            return;
        }
        if(getUrlParameter("userid")){
            userid = getUrlParameter("userid");
            LoadUserProfile(userid);
            return;
        }
        if (p.split("/").length >= 3) LoadUserProfile(parseInt(p.split("/")[2]));
        else ShowTab("#member-tab", "#button-member-tab");
    } else if (p == "/staff/member") {
        ShowTab("#staff-member-tab", "#button-staff-member-tab");
    } else if (p == "/leaderboard") ShowTab("#leaderboard-tab", "#button-leaderboard-tab");
    else if (p == "/ranking") ShowTab("#ranking-tab", "#button-ranking-tab");
    else if (p == "/application/my") ShowTab("#my-application-tab", "#button-my-application-tab");
    else if (p == "/application/all") ShowTab("#button-staff-application", "#button-staff-application-tab");
    else if (p == "/application/submit" || p == "/apply") ShowTab("#submit-application-tab", "#button-submit-application-tab");
    else if (p == "/staff/user") ShowTab("#staff-user-tab", "#button-staff-user");
    else if (p == "/audit") ShowTab("#audit-tab", "#button-audit-tab");
    else if (p == "/admin") ShowTab("#config-tab", "#button-config-tab");
    else if (p.startsWith("/images")) {
        filename = p.split("/")[2];
        window.location.href = "https://drivershub-cdn.charlws.com/assets/" + vtcprefix + "/" + filename;
    } else{
        ShowTab("#overview-tab", "#button-overview-tab");
        window.history.pushState("", "", '/yAFgHRTt');
    }
}

window.onpopstate = function (event){PathDetect();};

simplebarINIT = ["#sidebar", "#table_mini_leaderboard", "#table_new_driver","#table_online_driver", "#table_delivery_log", "#table_division_delivery", "#table_member_list"];
$(document).ready(async function () {
    $("body").keydown(function(e){if(e.which==16) shiftdown=true;});
    $("body").keyup(function(e){if(e.which==16) shiftdown=false;});
    $(".pageinput").val("1");
    setInterval(function () {
        $(".ol-unselectable").css("border-radius", "15px"); // map border
    }, 1000);
    setInterval(function(){$(".member-manage-dropdown").css("left","50px")},100);
    setTimeout(function(){for(i=0;i<simplebarINIT.length;i++)new SimpleBar($(simplebarINIT[i])[0]);},500);
    PathDetect();
    LoadCache();
    InitPhoneView();
    InitDistanceUnit();
    InitSearchByName();
    InitRankingDisplay();
    InitLeaderboardTimeRange();
    InitInputHandler();
    InitResizeHandler();
    PreserveApplicationQuestion();
    while(1){
        rolelist = JSON.parse(localStorage.getItem("rolelist"));
        perms = JSON.parse(localStorage.getItem("perms"));
        positions = JSON.parse(localStorage.getItem("positions"));
        applicationTypes = JSON.parse(localStorage.getItem("applicationTypes"));
        if(rolelist != undefined && perms != null && perms.admin != undefined && positions != undefined && applicationTypes != undefined) break;
        await sleep(100);
    }
    positionstxt = "";
    for (var i = 0; i < positions.length; i++) {
        positionstxt += positions[i] + "\n";
        $("#application2Answer3").append("<option value='" + positions[i].replaceAll("'", "\\'") + "'>" + positions[i] + "</option>");
    }
    positionstxt = positionstxt.slice(0, -1);
    $("#staffposedit").val(positionstxt);
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

