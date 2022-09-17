
function AjaxError(data, no_notification = false) {
    errmsg = JSON.parse(data.responseText).descriptor ? JSON.parse(data.responseText).descriptor : data.status + " " + data.statusText;
    if(!no_notification) toastFactory("error", "Error:", errmsg, 5000, false);
    console.warn(`API Request Failed: ${errmsg}\nDetails: ${data}`);
}

function GetMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

function GetAvatarSrc(discordid, avatarid){
    if (avatarid != null) {
        if (avatarid.startsWith("a_"))
            src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatarid + ".gif";
        else
            src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatarid + ".png";
    } else src = "/images/logo.png";
    return src;
}

function GetAvatarImg(src, userid, name){
    return `<a style="cursor:pointer" onclick="LoadUserProfile(${userid})">
        <img src="${src}" style="width:20px;border-radius:100%;display:inline" onerror="$(this).attr('src','/images/logo.png');">
        <b>${name}</b>
    </a>`
}

function CopyBannerURL(userid) {
    navigator.clipboard.writeText("https://" + window.location.hostname + "/banner/" + userid);
    return toastFactory("success", "Banner URL copied to clipboard!")
}

function TableNoData(columns){
    var ret = "";
    for(var i = 0 ; i < columns - 1 ; i ++)
        ret += `<td class="py-5 px-6 font-medium"></td>`;
    return `<tr class="text-sm">
      <td class="py-5 px-6 font-medium">No Data</td>
      ${ret}
    </tr>`
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
function LockBtn(btnid, btntxt = "Working..."){
    $(btnid).attr("disabled","disabled");
    btnvals[btnid] = $(btnid).html();
    $(btnid).html(btntxt);
}
function UnlockBtn(btnid){
    $(btnid).removeAttr("disabled");
    if(btnvals[btnid] == undefined) return;
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
dmapint = -1;
window.mapcenter = {}
window.autofocus = {}

levent = 1;
ldivision = 1;
dets2 = 1;
dats = 1;

function LoadDriverLeaderStatistics() {
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
                discordid = dottuser.discordid;
                avatar = GetAvatarSrc(discordid, dottuser.avatar);
                distance = TSeparator(parseInt(dottuser.distance * distance_ratio));
                $("#dot" + dott).html(GetAvatarImg(src, dottuser.userid, dottuser.name));
                $("#dot" +dott + "distance").html(`Driven ${distance}${distance_unit_txt}`);
            }
        });
    }
}

function loadLeaderboard(recurse = true) {
    GeneralLoad();
    LockBtn("#loadLeaderboardBtn", btntxt = "...");

    page = parseInt($("#lpages").val())
    if (page == "" || page == undefined || page <= 0) page = 1;

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
            UnlockBtn("#loadLeaderboardBtn");
            if (data.error) return AjaxError(data);

            $("#leaderboardTable").empty();
            leaderboard = data.response.list;

            // generate table / page control
            if (leaderboard.length == 0) {
                $("#leaderboardTableHead").hide();
                $("#leaderboardTable").append(`
            <tr class="text-sm">
              <td class="py-5 px-6 font-medium">No Data</td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
            </tr>`);
                $("#lpages").val(1);
                if (recurse) loadLeaderboard(recurse = false);
                return;
            }
            $("#leaderboardTableHead").show();
            totpage = Math.ceil(data.response.total_items / 10);
            if (page > totpage) {
                $("#lpages").val(1);
                if (recurse) loadLeaderboard(recurse = false);
                return;
            }
            if (page <= 0) {
                $("#lpages").val(1);
                page = 1;
            }
            $("#ltotpages").html(totpage);
            $("#leaderboardTableControl").children().remove();
            $("#leaderboardTableControl").append(`
            <button type="button" style="display:inline"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="$('#lpages').val(1);loadLeaderboard();">1</button>`);
            if (page > 3) {
                $("#leaderboardTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            for (var i = Math.max(page - 1, 2); i <= Math.min(page + 1, totpage - 1); i++) {
                $("#leaderboardTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#lpages').val(${i});loadLeaderboard();">${i}</button>`);
            }
            if (page < totpage - 2) {
                $("#leaderboardTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            if (totpage > 1) {
                $("#leaderboardTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#lpages').val(${totpage});loadLeaderboard();">${totpage}</button>`);
            }
            
            // fill table
            for (i = 0; i < leaderboard.length; i++) {
                user = leaderboard[i];
                userid = user.userid;
                name = user.name;
                distance = TSeparator(parseInt(user.distance * distance_ratio));
                discordid = user.discordid;
                avatar = GetAvatarSrc(discordid, user.avatar);
                totalpnt = TSeparator(parseInt(user.total));   
                $("#leaderboardTable").append(`<tr class="text-sm">
              <td class="py-5 px-6 font-medium">
                #${user.rank} ${GetAvatarImg(avatar, userid, name)}</td>
                <td class="py-5 px-6">${point2rank(parseInt(user.total_no_limit))} (#${user.rank_no_limit})</td>
                <td class="py-5 px-6">${distance}</td>
                <td class="py-5 px-6">${user.event}</td>
                <td class="py-5 px-6">${user.division}</td>
                <td class="py-5 px-6">${user.myth}</td>
              <td class="py-5 px-6">${totalpnt}</td>
            </tr>`);
            }
        },
        error: function (data) {
            UnlockBtn("#loadLeaderboardBtn");
            AjaxError(data);
        }
    })
}

function LoadDeliveryList(recurse = true) {
    GeneralLoad();
    LockBtn("#loadDeliveryBtn", btntxt = "...");

    page = parseInt($("#dpages").val())
    if (page == "" || page == undefined || page <= 0) page = 1;
    
    var start_time = -1, end_time = -1;
    if ($("#dstart").val() != "" && $("#dend").val() != "") {
        start_time = +new Date($("#dstart").val()) / 1000;
        end_time = +new Date($("#dend").val()) / 1000 + 86400;
    }

    speedlimit = parseInt($("#dspeedlimit").val());
    if (!isNumber(speedlimit)) speedlimit = 0; // make sure speedlimit is valid
    speedlimit /= distance_ratio; // convert to km/h

    game = 0;
    if (dets2 && !dats) game = 1;
    else if (!dets2 && dats) game = 2;
    else if (!dets2 && !dats) game = -1;

    $(".dgame").css("background-color", "");
    if (game == 0) $(".dgame").css("background-color", "skyblue");
    else $(".dgame" + game).css("background-color", "skyblue");
    if (!dets2 && !dats) start_time = 1, end_time = 2;

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog/list?page=" + page + "&speed_limit=" + parseInt(speedlimit) + "&start_time=" + start_time + "&end_time=" + end_time + "&game=" + game,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#loadDeliveryBtn");
            if (data.error) return AjaxError(data);

            $("#deliveryTable").empty();
            deliveries = data.response.list;

            if (deliveries.length == 0) {
                $("#deliveryTableHead").hide();
                $("#deliveryTable").append(`
            <tr class="text-sm">
              <td class="py-5 px-6 font-medium">No Data</td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
            </tr>`);
                $("#dpages").val(1);
                if (recurse) LoadDeliveryList(recurse = false);
                return;
            }
            $("#deliveryTableHead").show();
            totpage = Math.ceil(data.response.total_items / 10);
            if (page > totpage) {
                $("#dpages").val(1);
                if (recurse) LoadDeliveryList(recurse = false);
                return;
            }
            $("#dtotpages").html(totpage);
            $("#deliveryTableControl").children().remove();
            $("#deliveryTableControl").append(`
            <button type="button" style="display:inline"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="$('#dpages').val(1);LoadDeliveryList();">1</button>`);
            if (page > 3) {
                $("#deliveryTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            for (var i = Math.max(page - 1, 2); i <= Math.min(page + 1, totpage - 1); i++) {
                $("#deliveryTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#dpages').val(${i});LoadDeliveryList();">${i}</button>`);
            }
            if (page < totpage - 2) {
                $("#deliveryTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            if (totpage > 1) {
                $("#deliveryTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#dpages').val(${totpage});LoadDeliveryList();">${totpage}</button>`);
            }

            for (i = 0; i < deliveries.length; i++) {
                delivery = deliveries[i];
                distance = TSeparator(parseInt(delivery.distance * distance_ratio));
                cargo_mass = parseInt(delivery.cargo_mass / 1000) + "t";
                unittxt = "€";
                if (delivery.unit == 2) unittxt = "$";
                profit = TSeparator(delivery.profit);
                color = "";
                if (delivery.profit < 0) color = "grey";
                dextra = "";
                if (delivery.isdivision == true) dextra = "<span title='Validated Division Delivery'>" + SVG_VERIFIED + "</span>";
                $("#deliveryTable").append(`
            <tr class="text-sm" style="color:${color}">
            <td class="py-5 px-6 font-medium"><a style='cursor:pointer' onclick="deliveryDetail('${delivery.logid}')">${delivery.logid} ${dextra}</a></td>
              <td class="py-5 px-6 font-medium"><a style='cursor:pointer' onclick='LoadUserProfile(${delivery.userid})'>${delivery.name}</a></td>
              <td class="py-5 px-6 font-medium">${delivery.source_company}, ${delivery.source_city}</td>
              <td class="py-5 px-6 font-medium">${delivery.destination_company}, ${delivery.destination_city}</td>
              <td class="py-5 px-6 font-medium">${distance}${distance_unit_txt}</td>
              <td class="py-5 px-6 font-medium">${delivery.cargo} (${cargo_mass})</td>
              <td class="py-5 px-6 font-medium">${unittxt}${profit}</td>
            </tr>`);
            }
        },
        error: function (data) {
            UnlockBtn("#loadDeliveryBtn");
            AjaxError(data);
        }
    })
}
deliveryRoute = [];
rri = 0;
rrspeed = 20;
rrevents = [];
punit = "€";
curlogid = -1;
async function deliveryRoutePlay() {
    if (window.dn == undefined || window.dn.previousExtent_ == undefined) return toastFactory("error", "Error:", "Please zoom & drag the map to activate it.", 5000, false);
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
        $("#rp_speed").html(rrspeed);
        $("#rp_cur").html(rri + 1);
        $("#rp_pct").html(Math.round(rri / deliveryRoute.length * 100));
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

        x = deliveryRoute[rri][0];
        z = deliveryRoute[rri][1];
        for (var i = lastevent; i < rrevents.length; i++) {
            ex = rrevents[i].location.x;
            ez = rrevents[i].location.z;
            // distance of (x,z) and (ex,ez) <= 50, use euclid distance
            if (Math.sqrt(Math.pow(x - ex, 2) + Math.pow(z - ez, 2)) <= 50) {
                lastevent = i + 1;
                mt = $("#dmap").position().top;
                ml = $("#dmap").position().left;
                eventmsg = "";
                if (rrevents[i].type == "tollgate") {
                    cost = rrevents[i].meta.cost;
                    eventmsg = "Paid " + punit + TSeparator(cost) + " at toll gate.";
                } else if (rrevents[i].type == "refuel") {
                    amount = rrevents[i].meta.amount;
                    eventmsg = "Refueled " + TSeparator(parseInt(amount)) + "L of fuel.";
                } else if (rrevents[i].type == "collision") {
                    meta = rrevents[i].meta;
                    pct = parseFloat(meta.wear_engine) + parseFloat(meta.wear_chassis) + parseFloat(meta.wear_transmission) + parseFloat(meta.wear_cabin) + parseFloat(meta.wear_wheels);
                    eventmsg = "Collision!";
                    if (pct != NaN) eventmsg += " Damage: " + Math.round(pct * 1000) / 10 + "%";
                } else if (rrevents[i].type == "repair") {
                    eventmsg = "Truck repaired.";
                } else if (rrevents[i].type == "teleport") {
                    eventmsg = "Teleported.";
                } else if (rrevents[i].type == "fine") {
                    meta = rrevents[i].meta;
                    console.log(rrevents[i]);
                    finetype = meta.offence;
                    if (finetype == "speeding_camera") {
                        curspeed = TSeparator(parseInt(meta.speed * 3.6 * distance_ratio));
                        speedlimit = TSeparator(parseInt(meta.speed_limit * 3.6 * distance_ratio));
                        eventmsg = `Captured by speeding camera<br>${curspeed}${distance_unit_txt}/h (Speed Limit ${speedlimit}${distance_unit_txt}/h)<br>Fined ` + punit + TSeparator(meta.amount);
                    } else if (finetype == "speeding") {
                        curspeed = TSeparator(parseInt(meta.speed * 3.6 * distance_ratio));
                        speedlimit = TSeparator(parseInt(meta.speed_limit * 3.6 * distance_ratio));
                        eventmsg = `Caught by police car for speeding<br>${curspeed}${distance_unit_txt}/h (Speed Limit ${speedlimit}${distance_unit_txt}/h)<br>Fined ` + punit + TSeparator(meta.amount);
                    } else if (finetype == "crash") {
                        eventmsg = `Crash<br>Fined ` + punit + TSeparator(meta.amount);
                    } else if (finetype == "red_signal") {
                        eventmsg = `Red Signal Offence<br>Fined ` + punit + TSeparator(meta.amount);
                    } else if (finetype == "wrong_way") {
                        eventmsg = `Wrong Way<br>Fined ` + punit + TSeparator(meta.amount);
                    }
                } else if (rrevents[i].type == "speeding") {
                    meta = rrevents[i].meta;
                    curspeed = TSeparator(parseInt(parseInt(meta.max_speed) * 3.6 * distance_ratio));
                    speedlimit = TSeparator(parseInt(parseInt(meta.speed_limit) * 3.6 * distance_ratio));
                    eventmsg = `Speeding (No Fine)<br>${curspeed}${distance_unit_txt}/h (Speed Limit ${speedlimit}${distance_unit_txt}/h)`;
                } else if (rrevents[i].type == "ferry") {
                    meta = rrevents[i].meta;
                    eventmsg = `Ferry from ${meta.source_name} to ${meta.target_name}<br>Cost ${punit}${TSeparator(meta.cost)}`;
                }
                if (eventmsg != "") {
                    randomid = Math.random().toString(36).substring(7);
                    $(".rrevent").hide();
                    $("#dmap").append(`<a class="rrevent" id="rrevent-${randomid}" style='position:absolute;top:${mt+dmaph/2}px;left:${ml+dmapw/2}px;color:red;'>${eventmsg}</a>`);
                    setTimeout(function () {
                        $("#rrevent-" + randomid).fadeOut();
                    }, 3000);
                }
            }
        }

        await sleep(500 / rrspeed);

        while (dmapint != -999) {
            await sleep(500);
            rri -= 1;
        }
    }
    $("#rrplay").html("Replay");
    setTimeout(function () {
        $(".dmap-player").remove();
        window.mapcenter["dmap"] = undefined;
    }, 5000);
}

function rrplayswitch() {
    if ($("#rrplay").html() == "Replay") deliveryDetail(curlogid);
    if (window.dn == undefined || window.dn.previousExtent_ == undefined) return toastFactory("error", "Error:", "Please zoom & drag the map to activate it.", 5000, false);
    if (dmapint == -999) {
        dmapint = -2;
        $("#rrplay").html("Play");
    } else {
        $("#rrplay").html("Pause");
        deliveryRoutePlay(50);
    }
}

function deliveryDetail(logid) {
    curlogid = logid;
    window.autofocus["dmap"] = -2;
    $("#routereplaydiv").hide();
    $("#routereplayload").show();
    rri = 0;
    rrspeed = 20;
    $("#DeliveryInfoBtn" + logid).attr("disabled", "disabled");
    $("#DeliveryInfoBtn" + logid).html("Loading...");
    $("#rp_cur").html("0");
    $("#rp_tot").html("0");
    $("#rp_pct").html("0");
    $("#rrplay").html("Play");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog?logid=" + String(logid),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#DeliveryInfoBtn" + logid).removeAttr("disabled");
            $("#DeliveryInfoBtn" + logid).html("Details");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000,
                false);
            info = "";
            if (!data.error) {
                window.history.pushState("", "", '/delivery/' + logid);
                d = data.response;
                userid = d.userid;
                name = d.name;
                d = d.detail;
                tp = d.type;
                d = d.data.object;
                start_time = +new Date(d.start_time);
                stop_time = +new Date(d.stop_time);
                duration = "N/A";
                if (start_time > 86400 * 1000) duration = String((stop_time - start_time) / 1000).toHHMMSS(); // in case start time is 19700101 and timezone
                planned_distance = TSeparator(parseInt(d.planned_distance * distance_ratio)) + distance_unit_txt;
                fuel_used_org = d.fuel_used;
                fuel_used = TSeparator(parseInt(d.fuel_used * fuel_ratio)) + fuel_unit_txt;
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
                truck = d.truck.brand.name + " " + d.truck.name;
                truck_brand_id = d.truck.brand.unique_id;
                license_plate = d.truck.license_plate;
                top_speed = parseInt(d.truck.top_speed * 3.6 * distance_ratio);
                trailer = "";
                trs = "";
                if (d.trailers.length > 1) trs = "s";
                for (var i = 0; i < d.trailers.length; i++) trailer += d.trailers[i].license_plate + " | ";
                trailer = trailer.slice(0,-3);
                punit = "€";
                if (!d.game.short_name.startsWith("e")) punit = "$";
                rrevents = d.events;
                meta = d.events[d.events.length - 1].meta;
                if (tp == "job.delivered") {
                    revenue = TSeparator(meta.revenue);
                    earned_xp = meta.earned_xp;
                    cargo_damage = meta.cargo_damage;
                    distance = TSeparator(parseInt(meta.distance * distance_ratio)) + distance_unit_txt;
                    auto_park = meta.auto_park;
                    auto_load = meta.auto_load;
                    avg_fuel = TSeparator(parseInt((fuel_used_org * fuel_ratio) / (meta.distance * distance_ratio) * 100)) + fuel_unit_txt + "/100" + distance_unit_txt;
                } else if (tp == "job.cancelled") {
                    distance = TSeparator(parseInt(d.driven_distance * distance_ratio)) + distance_unit_txt;
                    distance_org = d.driven_distance;
                    penalty = TSeparator(meta.penalty);
                    avg_fuel = TSeparator(parseInt((fuel_used_org * fuel_ratio) / (distance_org * distance_ratio) * 100)) + fuel_unit_txt + "/100" + distance_unit_txt;
                }

                $(".ddcol").children().remove();
                $(".ddcol").children().remove();
                $("#ddcol1t>img,#ddcol2t>img,#ddcol3t>img").remove();
                $("#ddcol1t").append(`<img style="display:inline" onerror="$(this).hide();" src="https://map.charlws.com/overlays/${source_company_id}.png">`);
                $("#ddcol2t").append(`<img style="display:inline" onerror="$(this).hide();" src="https://map.charlws.com/overlays/${destination_company_id}.png">`);
                $("#ddcol1").append(`<p><b>${source_company}</b>, ${source_city}</p>`);
                $("#ddcol1").append(`<p><b>${cargo}</b> <i>(${cargo_mass})</i></p>`);
                $("#ddcol1").append(`<p>Planned <b>${planned_distance}</b></p>`);
                $("#ddcol2").append(`<p><b>${destination_company}</b>, ${destination_city}</p>`);
                $("#ddcol2").append(`<p>Driven <b>${distance}</b></p>`);
                offence = 0;
                for (var i = 0; i < rrevents.length; i++) {
                    if (rrevents[i].type == "fine") {
                        offence += parseInt(rrevents[i].meta.amount);
                    }
                }
                offence = -offence;
                offence = TSeparator(offence);
                if (tp == "job.delivered") {
                    $("#ddcol2").append(`<p>Damage <b>${parseInt(cargo_damage * 100)}%</b> / XP <b>${earned_xp}</b></p>`);
                    $("#ddcol2").append(`<p>Profit <b>${revenue} ${punit}</b> / Offence <b>${offence} ${punit}</b></p>`);
                } else if (tp == "job.cancelled") {
                    $("#ddcol2").append(`<p>Damage <b>${parseInt(data.response.data.data.object.cargo.damage * 100)}%</b></p>`);
                    $("#ddcol2").append(`<p>Penalty <b>${penalty} ${punit}</b> / Offence <b>${offence} ${punit}</b></p>`);
                }
                $("#ddcol3").append(`<p>Max Speed <b>${top_speed} ${distance_unit_txt}/h</p>`);
                $("#ddcol3").append(`<p>Fuel Avg <b>${avg_fuel}</b> / Tot <b>${fuel_used}</b></p>`);
                $("#ddcol3").append(`<p>Truck <b>${truck}</b> (<i>${license_plate})</i></p>`);
                $("#ddcol3").append(`<p>Trailer <i>${trailer}</i></p>`);

                dt = getDateTime(data.response.timestamp * 1000);

                $("#dlogdriver").html(`<a style='cursor:pointer' onclick='LoadUserProfile(${userid})'>${name}</a>`);
                if (tp == "job.cancelled") {
                    $("#dlogid").html(`${logid} (Cancelled)`);
                } else {
                    $("#dlogid").html(`${logid}
                    <button type="button" style="display:inline;padding:5px" id="divisioninfobtn"
              class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
              onclick="GetDivisionInfo(${logid})">Division</button>`);
                }
                $("#dlogdistance").html(parseInt(data.response.distance * distance_ratio));
                $("#dlogtime").html(dt);
                if (tp == "job.delivered") {
                    extra = "";
                    if (auto_park == "1") extra += "Auto Park | ";
                    if (auto_load == "1") extra += "Auto Load | ";
                    if (extra != "") {
                        $("#dlogextra").remove();
                        $("#dlogbasic").append(`<p id="dlogextra"><b>${extra.slice(0, -3)}</b></p>`);
                    }
                }

                $("#routereplayload").html("Route replay loading...");

                tabname = "#DeliveryDetailTab";
                $(".tabs").hide();
                $(tabname).show();
                setTimeout(function () {
                    telemetry = data.response.telemetry.split(";");
                    basic = telemetry[0].split(",");
                    tver = 1;
                    if (basic[0].startsWith("v2")) tver = 2;
                    else if (basic[0].startsWith("v3")) tver = 3;
                    else if (basic[0].startsWith("v4")) tver = 4;
                    else if (basic[0].startsWith("v5")) tver = 5;
                    else if (basic[0].startsWith("v")) {
                        return toastFactory("error", "Error:", "Unsupported telemetry data compression version", 5000, false);
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
                        for (i = 0, j = 0; i < route.length; i++) {
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
                                if (cx == 0 && cz == 0) continue;
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
                        $("#routereplayload").html("Route replay not available.");
                        return;
                    }
                    setTimeout(function () {
                        $("#routereplayload").hide();
                        $("#routereplaydiv").fadeIn();
                    }, 2000);
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
                    dmapint = setInterval(function () {
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
                    }, 500);
                }, 500);
            }
        },
        error: function (data) {
            ShowTab("#HomeTab", "#HomeTabBtn");
            $("#DeliveryInfoBtn" + logid).removeAttr("disabled");
            $("#DeliveryInfoBtn" + logid).html("Details");
            AjaxError(data);
        }
    });
}

function LoadUserDeliveryList(recurse = true) {
    GeneralLoad();
    LockBtn("#loadUserDeliveryBtn", btntxt = "...");

    page = parseInt($("#udpages").val())
    if (page == "" || page == undefined || page <= 0) page = 1;

    var start_time = -1, end_time = -1;
    if ($("#udstart").val() != "" && $("#udend").val() != "") {
        start_time = +new Date($("#udstart").val()) / 1000;
        end_time = +new Date($("#udend").val()) / 1000 + 86400;
    }

    speedlimit = parseInt($("#udspeedlimit").val());
    if (!isNumber(speedlimit)) speedlimit = 0;
    speedlimit /= distance_ratio;

    game = 0;
    if (dets2 && !dats) game = 1;
    else if (!dets2 && dats) game = 2;
    else if (!dets2 && !dats) game = -1;
    $(".dgame").css("background-color", "");
    if (game == 0) $(".dgame").css("background-color", "skyblue");
    else $(".dgame" + game).css("background-color", "skyblue");
    if (!dets2 && !dats) start_time = 1, end_time = 2;

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog/list?userid=" + useridCurrentProfile + "&speed_limit=" + parseInt(speedlimit) + "&page=" + page + "&start_time=" + start_time + "&end_time=" + end_time + "&game=" + game,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#loadUserDeliveryBtn");
            if (data.userDeliveryTable) return AjaxError(data);
            
            $("#userDeliveryTable").empty();
            deliveries = data.response.list;

            if (deliveries.length == 0) {
                $("#userDeliveryTableHead").hide();
                $("#userDeliveryTable").append(TableNoData(6));
                $("#udpages").val(1);
                if (recurse) LoadUserDeliveryList(recurse = false);
                return;
            }
            $("#userDeliveryTableHead").show();
            totpage = Math.ceil(data.response.total_items / 10);
            if (page > totpage) {
                $("#udpages").val(1);
                if (recurse) LoadUserDeliveryList(recurse = false);
                return;
            }
            $("#udtotpages").html(totpage);
            $("#userDeliveryTableControl").children().remove();
            $("#userDeliveryTableControl").append(`
            <button type="button" style="display:inline"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="$('#udpages').val(1);LoadUserDeliveryList();">1</button>`);
            if (page > 3) {
                $("#userDeliveryTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            for (var i = Math.max(page - 1, 2); i <= Math.min(page + 1, totpage - 1); i++) {
                $("#userDeliveryTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#udpages').val(${i});LoadUserDeliveryList();">${i}</button>`);
            }
            if (page < totpage - 2) {
                $("#userDeliveryTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            if (totpage > 1) {
                $("#userDeliveryTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#udpages').val(${totpage});LoadUserDeliveryList();">${totpage}</button>`);
            }

            for (i = 0; i < deliveries.length; i++) {
                delivery = deliveries[i];
                distance = TSeparator(parseInt(delivery.distance * distance_ratio));
                cargo_mass = parseInt(delivery.cargo_mass / 1000);
                unittxt = "€";
                if (delivery.unit == 2) unittxt = "$";
                profit = TSeparator(delivery.profit);
                color = "";
                if (delivery.profit < 0) color = "grey";
                dextra = "";
                if (delivery.isdivision == true) dextra = "<span title='Validated Division Delivery'>" + SVG_VERIFIED + "</span>";
                $("#userDeliveryTable").append(`
            <tr class="text-sm" style="color:${color}">
            <td class="py-5 px-6 font-medium"><a style='cursor:pointer' onclick="deliveryDetail('${delivery.logid}')">${delivery.logid} ${dextra}</a></td>
              <td class="py-5 px-6 font-medium">${delivery.source_company}, ${delivery.source_city}</td>
              <td class="py-5 px-6 font-medium">${delivery.destination_company}, ${delivery.destination_city}</td>
              <td class="py-5 px-6 font-medium">${distance}${distance_unit_txt}</td>
              <td class="py-5 px-6 font-medium">${delivery.cargo} (${cargo_mass}t)</td>
              <td class="py-5 px-6 font-medium">${unittxt}${profit}</td>
            </tr>`);
            }
        },
        error: function (data) {
            UnlockBtn("#loadUserDeliveryBtn");
            AjaxError(data);
        }
    })
}

function ExportDeliveryLog() {
    var start_time = -1, end_time = -1;
    if ($("#lbstart").val() != "" && $("#lbend").val() != "") {
        start_time = +new Date($("#export_start_date").val()) / 1000;
        end_time = +new Date($("#export_end_date")) / 1000 + 86400;
    }

    LockBtn("#exportDLogBtn");
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
            UnlockBtn("#exportDLogBtn");
            FileOutput("export.csv", data);
            if (data.error) return AjaxError(data);
        },
        error: function (data) {
            UnlockBtn("#exportDLogBtn");
            AjaxError(data);
        }
    })
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
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            else return toastFactory("success", "Success", "You have got your new role!", 5000, false);
        },
        error: function (data) {
            UnlockBtn(".requestRoleBtn");
            AjaxError(data);
        }
    })
}

function LoadMemberList(recurse = true) {
    GeneralLoad();
    LockBtn("#searchMemberBtn", btntxt = "...");

    page = parseInt($("#mpages").val())
    if (page == "" || page == undefined || page <= 0) page = 1;

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/list?page=" + page + "&order_by=highest_role&order=desc&name=" + $("#searchname").val(),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#searchMemberBtn");
            if (data.error) return AjaxError(data);

            $("#membersTable").empty();
            users = data.response.list;

            if (users.length == 0) {
                $("#membersTableHead").hide();
                $("#membersTable").append(TableNoData(2));
                $("#mpages").val(1);
                if (recurse) LoadMemberList(recurse = false);
                return;
            }
            $("#membersTableHead").show();
            totpage = Math.ceil(data.response.total_items / 10);
            if (page > totpage) {
                $("#mpages").val(1);
                if (recurse) LoadMemberList(recurse = false);
                return;
            }
            $("#mtotpages").html(totpage);
            $("#membersTableControl").children().remove();
            $("#membersTableControl").append(`
            <button type="button" style="display:inline"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="$('#mpages').val(1);LoadMemberList();">1</button>`);
            if (page > 3) {
                $("#membersTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            for (var i = Math.max(page - 1, 2); i <= Math.min(page + 1, totpage - 1); i++) {
                $("#membersTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#mpages').val(${i});LoadMemberList();">${i}</button>`);
            }
            if (page < totpage - 2) {
                $("#membersTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            if (totpage > 1) {
                $("#membersTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#mpages').val(${totpage});LoadMemberList();">${totpage}</button>`);
            }

            for (i = 0; i < users.length; i++) {
                user = users[i];
                highestrole = user.highestrole;
                color = vtccolor; // Member
                if (highestrole < 100) color = "#ff0000"; // Staff
                highestrole = rolelist[highestrole];
                if (highestrole == undefined) highestrole = "/";
                discordid = user.discordid;
                avatar = GetAvatarSrc(discordid, user.avatar);
                totalpnt = parseInt(user.totalpnt);
                $("#membersTable").append(`
            <tr class="text-sm">
              <td class="py-5 px-6 font-medium">${user.userid}</td>
              <td class="py-5 px-6 font-medium" style="color:${color}">${GetAvatarImg(avatar, user.userid, user.name)}</td>
              <td class="py-5 px-6 font-medium" style="color:${color}">${highestrole}</td>
            </tr>`);
            }

            // user = data.response.staff_of_the_month;
            // discordid = user.discordid;
            // avatar = user.avatar;
            // src = "";
            // if (avatar != null) {
            //     if (avatar.startsWith("a_"))
            //         src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif";
            //     else
            //         src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png";
            // } else {
            //     avatar = "https://drivershub-cdn.charlws.com/assets/"+vtcprefix+"/logo.png";
            // }
            // $("#sotm").html(`<a style='cursor:pointer' onclick='LoadUserProfile("${user.userid}")'>${user.name}</a>`);
            // $("#sotma").attr("src", src);

            // user = data.response.driver_of_the_month;
            // discordid = user.discordid;
            // avatar = user.avatar;
            // src = "";
            // if (avatar != null) {
            //     if (avatar.startsWith("a_"))
            //         src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif";
            //     else
            //         src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png";
            // }
            // $("#dotm").html(`<a style='cursor:pointer' onclick='LoadUserProfile("${user.userid}")'>${user.name}</a>`);
            // $("#dotma").attr("src", src);

        },
        error: function (data) {
            UnlockBtn("#searchMemberBtn");
            AjaxError(data);
        }
    })
}

useridToUpdateRole = -1;

function GetMemberRoles() {
    GeneralLoad();
    LockBtn("#fetchRolesBtn");

    val = $("#memberroleid").val();
    $("#rolelist").children().children().prop("checked", false);
    $("#memberrolename").html("");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/list?page=1&order_by=highest_role&order=desc&name=" + val,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            d = data.response.list;
            if (d.length == 0) {
                UnlockBtn("#fetchRolesBtn");
                return toastFactory("error", "Error:", "No member with name " + val + " found.", 5000, false);
            }
            useridToUpdateRole = d[0].userid;

            $.ajax({
                url: apidomain + "/" + vtcprefix + "/user?userid=" + String(useridToUpdateRole),
                type: "GET",
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                success: function (data) {
                    UnlockBtn("#fetchRolesBtn");
                    if (data.error) return AjaxError(data);
                    d = data.response;
                    roles = d.roles;
                    $("#memberrolename").html(d.name + " (" + useridToUpdateRole + ")");
                    for (var i = 0; i < roles.length; i++)
                        $("#role" + roles[i]).prop("checked", true);
                    toastFactory("success", "Success!", "Existing roles are fetched!", 5000, false);
                },
                error: function (data) {
                    UnlockBtn("#fetchRolesBtn");
                    AjaxError(data);
                }
            });
        },
        error: function (data) {
            return toastFactory("error", "Error:", "Failed to get User ID", 5000, false);
        }
    })
}

function UpdateMemberRoles() {
    GeneralLoad();
    LockBtn("#updateMemberRolesBtn");

    d = $('input[name="assignrole"]:checked');
    roles = [];
    for (var i = 0; i < d.length; i++) {
        roles.push(d[i].id.replaceAll("role", ""));
    }

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/roles",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "userid": useridToUpdateRole,
            "roles": roles.join(",")
        },
        success: function (data) {
            UnlockBtn("#updateMemberRolesBtn");
            if (data.error) return AjaxError(data);
            toastFactory("success", "Success!", "Member roles updated!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#updateMemberRolesBtn");
            AjaxError(data);
        }
    });
}

function UpdateMemberPoints() {
    userid = $("#memberpntid").val();
    if (!isNumber(userid)) {
        toastFactory("error", "Error:", "Invalid User ID", 5000, false);
        return;
    }

    GeneralLoad();
    LockBtn("#updateMemberPointsBtn");

    distance = $("#memberpntdistance").val();
    mythpoint = $("#memberpntmyth").val();
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
            "userid": userid,
            "distance": distance,
            "mythpoint": mythpoint,
        },
        success: function (data) {
            UnlockBtn("#updateMemberPointsBtn");
            if (data.error) return AjaxError(data);
            toastFactory("success", "Success!", "Member points updated!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#updateMemberPointsBtn");
            AjaxError(data);
        }
    });
}

useridToDismiss = 0;

function DismissUser() {
    userid = $("#dismissUserID").val();
    GeneralLoad();

    if ($("#dismissbtn").html() != "Confirm?" || useridToDismiss != userid) {
        LockBtn("#dismissbtn");
        
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/user?userid=" + String(userid),
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                UnlockBtn("#dismissbtn");
                $("#memberdismissname").html("");
                if (data.error) return AjaxError(data);

                d = data.response;
                roles = d.roles;
                $("#memberdismissname").html("Dismiss <b>" + d.name + "</b>?");
                $("#dismissbtn").html("Confirm?");
                useridToDismiss = userid;
            },
            error: function (data) {
                UnlockBtn("#dismissbtn");
                AjaxError(data);
            }
        });
        return;
    } else {
        LockBtn("#dismissbtn");
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/member/dismiss?userid=" + String(userid),
            type: "DELETE",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                UnlockBtn("#dismissbtn");
                $("#memberdismissname").html("");
                $("#dismissUserID").val("");
                if (data.error) return AjaxError(data);
                toastFactory("success", "Success", "Member dismissed", 5000, false);
            },
            error: function (data) {
                UnlockBtn("#dismissbtn");
                AjaxError(data);
            }
        });
    }
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

    $("#aucs1").attr("onclick", `chartscale=1;loadChart(${userid});`);
    $("#aucs2").attr("onclick", `chartscale=2;loadChart(${userid});`);
    $("#aucs3").attr("onclick", `chartscale=3;loadChart(${userid});`);
    $("#aaddup1").attr("onclick", `addup=1-addup;loadChart(${userid});`);
    loadChart(userid);

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
                ShowTab("#HomeTab", "#HomeTabBtn");
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
                                    info += `<p>Distance: ${d.distance}</p>`;
                                    info += `<p>Event: ${d.event}</p>`;
                                    info += `<p>Division: ${d.division}</p>`;
                                    info += `<p>Myth: ${d.myth}</p>`;
                                    info += `<p><b>Total: ${d.total_no_limit}</b></p>`;
                                    info += `<p><b>Rank: #${d.rank_no_limit} (${point2rank(d.total_no_limit)})</b></p>`;
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
            ShowTab("#HomeTab", "#HomeTabBtn");
            AjaxError(data);
        }
    });
}
sc = undefined;
chartscale = 2;
addup = 0;

async function LoadChart(userid = -1) {
    if (userid != -1) {
        $(".ucs").css("background-color", "");
        $("#ucs" + chartscale).css("background-color", "skyblue");
        $("#uaddup" + addup).css("background-color", "skyblue");
    } else {
        $(".cs").css("background-color", "");
        $("#cs" + chartscale).css("background-color", "skyblue");
        $("#addup" + addup).css("background-color", "skyblue");
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
                    ts = pad(ts.getDate(), 2) + "/" + pad((ts.getMonth() + 1), 2);
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
            $("#alldriver").html(drivers);
            $("#newdriver").html(newdrivers);
            $("#alldistance").html(distance);
            $("#newdistance").html(newdistance);
            $("#alljob").html(jobs);
            $("#newjob").html(newjobs);
            $("#allprofit").html(europrofit + " + " + dollarprofit);
            $("#newprofit").html(neweuroprofit + " + " + newdollarprofit);
            $("#dprofit").html(neweuroprofit + " + " + newdollarprofit);
            $("#allfuel").html(fuel);
            $("#newfuel").html(newfuel);

            $("#dalljob").html(newjobs);
            $("#dtotdistance").html(newdistance);

            const ctx = document.getElementById('deliveryStatsChart').getContext('2d');
            const config = {
                type: 'pie',
                data: {
                    labels: ['Euro Truck Simulator 2', 'American Truck Simulator'],
                    datasets: [{
                        label: 'Game Preference',
                        data: [d.job.all.ets2.tot, d.job.all.ats.tot],
                        backgroundColor: ["skyblue", "pink"],
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Game Preference'
                        }
                    }
                },
            };
            if (deliveryStatsChart != undefined) deliveryStatsChart.destroy();
            deliveryStatsChart = new Chart(ctx, config);
        }
    });
}

function LoadStats(basic = false) {
    if (curtab != "#HomeTab" && curtab != "#Delivery") return;
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
            $("#alldriver").html(drivers);
            $("#newdriver").html(newdrivers);
            $("#alldistance").html(distance);
            $("#newdistance").html(newdistance);
            $("#alljob").html(jobs);
            $("#newjob").html(newjobs);
            $("#allprofit").html(europrofit + " + " + dollarprofit);
            $("#newprofit").html(neweuroprofit + " + " + newdollarprofit);
            $("#dprofit").html(neweuroprofit + " + " + newdollarprofit);
            $("#allfuel").html(fuel);
            $("#newfuel").html(newfuel);

            $("#dalljob").html(newjobs);
            $("#dtotdistance").html(newdistance);

            const ctx = document.getElementById('deliveryStatsChart').getContext('2d');
            const config = {
                type: 'pie',
                data: {
                    labels: ['Euro Truck Simulator 2', 'American Truck Simulator'],
                    datasets: [{
                        label: 'Game Preference',
                        data: [d.job.all.ets2.tot, d.job.all.ats.tot],
                        backgroundColor: ["skyblue", "pink"],
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Game Preference'
                        }
                    }
                },
            };
            if (deliveryStatsChart != undefined) deliveryStatsChart.destroy();
            deliveryStatsChart = new Chart(ctx, config);
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
                if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
                users = data.response.list;
                $("#leaderboard").empty();
                for (var i = 0; i < Math.min(users.length, 5); i++) {
                    user = users[i];
                    userid = user.userid;
                    name = user.name;
                    discordid = user.discordid;
                    avatar = user.avatar;
                    totalpnt = TSeparator(parseInt(user.total));
                    if (avatar != null) {
                        if (avatar.startsWith("a_"))
                            src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif";
                        else
                            src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png";
                    } else {
                        avatar = "https://drivershub-cdn.charlws.com/assets/"+vtcprefix+"/logo.png";
                    }
                    $("#leaderboard").append(`<tr class="text-sm">
              <td class="py-5 px-6 font-medium">
                <a style="cursor: pointer" onclick="LoadUserProfile(${userid})"><img src='${src}' width="20px" style="display:inline;border-radius:100%" onerror="$(this).attr('src','https://drivershub-cdn.charlws.com/assets/`+vtcprefix+`/logo.png');"> ${name}</a></td>
              <td class="py-5 px-6">${totalpnt}</td>
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
                if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
                users = data.response.list;
                $("#newdriverTable").empty();
                for (var i = 0; i < Math.min(users.length, 5); i++) {
                    user = users[i];
                    userid = user.userid;
                    name = user.name;
                    discordid = user.discordid;
                    avatar = user.avatar;
                    dt = new Date(user.join_timestamp * 1000);
                    joindt = pad(dt.getDate(), 2) + "/" + pad(dt.getMonth() + 1, 2);
                    if (avatar != null) {
                        if (avatar.startsWith("a_"))
                            src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif";
                        else
                            src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png";
                    } else {
                        avatar = "https://drivershub-cdn.charlws.com/assets/"+vtcprefix+"/logo.png";
                    }
                    $("#newdriverTable").append(`<tr class="text-sm">
              <td class="py-5 px-6 font-medium">
                <a style="cursor: pointer" onclick="LoadUserProfile(${userid})"><img src='${src}' width="20px" style="display:inline;border-radius:100%" onerror="$(this).attr('src','https://drivershub-cdn.charlws.com/assets/`+vtcprefix+`/logo.png');"> ${name}</a></td>
              <td class="py-5 px-6">${joindt}</td>
            </tr>`);
                }
            }
        });
    }
}
function LoadAuditLog(recurse = true) {
    page = parseInt($("#auditpages").val());
    if (page == "" || page == undefined || page <= 0) page = 1;
    
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/audit?page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            $("#auditTable").empty();
            audits = data.response.list;

            if (audits.length == 0) {
                $("#auditTableHead").hide();
                $("#auditTable").append(TableNoData(3));
                $("#auditpages").val(1);
                if (recurse) LoadAuditLog(recurse = false);
                return;
            }
            $("#auditTableHead").show();
            totpage = Math.ceil(data.response.total_items / 30);
            if (page > totpage) {
                $("#auditpages").val(1);
                if (recurse) LoadAuditLog(recurse = false);
                return;
            }
            $("#audittotpages").html(totpage);
            $("#auditTableControl").children().remove();
            $("#auditTableControl").append(`
            <button type="button" style="display:inline"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="$('#auditpages').val(1);LoadAuditLog();">1</button>`);
            if (page > 3) {
                $("#auditTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            for (var i = Math.max(page - 1, 2); i <= Math.min(page + 1, totpage - 1); i++) {
                $("#auditTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#auditpages').val(${i});LoadAuditLog();">${i}</button>`);
            }
            if (page < totpage - 2) {
                $("#auditTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            if (totpage > 1) {
                $("#auditTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#auditpages').val(${totpage});LoadAuditLog();">${totpage}</button>`);
            }

            for (i = 0; i < audits.length; i++) {
                audit = audits[i];
                dt = getDateTime(audit.timestamp * 1000);
                op = parseMarkdown(audit.operation).replace("\n", "<br>");
                $("#auditTable").append(`
        <tr class="text-sm">
          <td class="py-5 px-6 font-medium">${audit.user}</td>
          <td class="py-5 px-6 font-medium">${op}</td>
          <td class="py-5 px-6 font-medium">${dt}</td>
        </tr>`);
            }
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
            toastFactory("success", "Success!", "About Me updated!", 5000, false);
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
            toastFactory("success", "Success", "Application Token generated!", 5000, false);
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
            toastFactory("success", "Success", "Application Token Disabled!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#disableAppTokenBtn");
            AjaxError(data);
        }
    });
}

bannedUserList = {};

function LoadUserList(recurse = true) {
    page = parseInt($("#pupages").val())
    if (page == "" || page == undefined || page <= 0) page = 1;

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/list?page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            $("#usersTable").empty();
            users = data.response.list;

            if (users.length == 0) {
                $("#usersTableHead").hide();
                $("#usersTable").append(TableNoData(2));
                $("#pupages").val(1);
                if (recurse) LoadUserList(recurse = false);
                return;
            }
            $("#usersTableHead").show();
            totpage = Math.ceil(data.response.total_items / 10);
            if (page > totpage) {
                $("#pupages").val(1);
                if (recurse) LoadUserList(recurse = false);
                return;
            }
            $("#putotpages").html(totpage);
            $("#usersTableControl").children().remove();
            $("#usersTableControl").append(`
            <button type="button" style="display:inline"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="$('#pupages').val(1);LoadUserList();">1</button>`);
            if (page > 3) {
                $("#usersTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            for (var i = Math.max(page - 1, 2); i <= Math.min(page + 1, totpage - 1); i++) {
                $("#usersTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#pupages').val(${i});LoadUserList();">${i}</button>`);
            }
            if (page < totpage - 2) {
                $("#usersTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            if (totpage > 1) {
                $("#usersTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#pupages').val(${totpage});LoadUserList();">${totpage}</button>`);
            }

            for (i = 0; i < users.length; i++) {
                user = users[i];
                bantxt = "Ban";
                bantxt2 = "";
                color = "";
                accept = `<td class="py-5 px-6 font-medium"><a style="cursor:pointer;color:grey">Accept as member</td>`;
                if (user.is_banned) color = "grey", bantxt = "Unban", bantxt2 = "(Banned)", bannedUserList[user.discordid] = user.ban_reason;
                else accept = `<td class="py-5 px-6 font-medium"><a style="cursor:pointer;color:lightgreen" id="UserAddBtn${user.discordid}" onclick="AddUser('${user.discordid}')">Accept as member</td>`;
                $("#usersTable").append(`
            <tr class="text-sm">
              <td class="py-5 px-6 font-medium" style='color:${color}'>${user.discordid}</td>
              <td class="py-5 px-6 font-medium" style='color:${color}'>${user.name} ${bantxt2}</td>
              ${accept}
              <td class="py-5 px-6 font-medium"><a style="cursor:pointer;color:red" onclick="banGo('${user.discordid}')">${bantxt}</td>
              <td class="py-5 px-6 font-medium">
              <button type="button" style="display:inline;padding:5px" id="UserInfoBtn${user.discordid}" 
              class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
              onclick="GetUserDetail('${user.discordid}')">Details</button></td>
            </tr>`)
            }
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
            return toastFactory("error", "Error:", "Please enter a valid discord id.", 5000, false);
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
            if (data.error) return AjaxError(data);
            toastFactory("success", "Success", "User added successfully. User ID: " + data.response.userid, 5000, false);
            LoadUserList();
        },
        error: function (data) {
            UnlockBtn("#addUserBtn");
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
            toastFactory("success", "Success", "User Discord Account Updated!", 5000, false);
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
            toastFactory("success", "Success", "User deleted!", 5000, false);
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
            toastFactory("success", "Success", "User account connections unbound!", 5000, false);
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
        return toastFactory("error", "Error:", "Invalid discord id.", 5000, false);

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
            toastFactory("success", "Success", "User banned successfully.", 5000, false);
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
        return toastFactory("error", "Error:", "Invalid discord id.", 5000, false);
    
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
            toastFactory("success", "Success", "User unbanned successfully.", 5000, false);
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
            if (data.error) toastFactory("error", "Error:", data.descriptor, 5000, false);
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
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000,
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
        return toastFactory("error", "Invalid application token!");
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
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            toastFactory("success", "Success", data.response, 5000, false);
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
        toastFactory("error", "Error:", "Failed to parse config! Make sure it's in correct JSON Format!", 5000, false);
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
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            toastFactory("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            $("#updateConfigBtn").html("Update");
            $("#updateConfigBtn").removeAttr("disabled");
            AjaxError(data);
        }
    })
}

function ReloadServer() {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/reload",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            toastFactory("success", "Success", data.response, 5000, false);
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
                toastFactory("success", "Success", "Password login disabled", 5000, false);
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
            toastFactory("success", "Success", data.response, 5000, false);
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
            $("#sessiontable").empty();
            sessions = data.response.list;
            for (var i = 0; i < sessions.length; i++) {
                if (sha256(localStorage.getItem("token")) != sessions[i].hash)
                    opbtn = `<button type="button" style="display:inline;padding:5px" id="revokeTokenBtn-${sessions[i].hash}"
                    class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                    onclick="RevokeToken('${sessions[i].hash}')">Revoke</button>`;
                else opbtn = `(Current)`;

                $("#sessiontable").append(`<tr class="text-sm">
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
            toastFactory("success", "Success", data.response, 5000, false);
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
            setTimeout(function(){window.location.href = "/login";},1000);
            toastFactory("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}
function LoadAnnouncement(){
    annpage = 2;
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/announcement?page=1",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            ann = data.response.list;
            if (ann.length > 0) {
                a = ann[0];
                dt = getDateTime(a.timestamp * 1000);
                content = "<span style='font-size:10px;color:grey'><b>#" + a.announcementid + "</b> | <b>" + dt +
                    "</b> by <a style='cursor:pointer' onclick='LoadUserProfile(" + a.author.userid + ")'><i>" + a.author.name + "</i></a></span><br>" +
                    parseMarkdown(a.content.replaceAll("\n", "<br>"));
                TYPES = ["info", "info", "warning", "criticle", "resolved"];
                banner = genBanner(TYPES[a.announcement_type], a.title, content);
            }
            for (i = 0; i < ann.length; i++) {
                a = ann[i];
                dt = getDateTime(a.timestamp * 1000);
                content = "<span style='font-size:10  px;color:grey'><b>#" + a.announcementid + "</b> | <b>" + dt +
                    "</b> by <a style='cursor:pointer' onclick='LoadUserProfile(" + a.author.userid + ")'><i>" + a.author.name + "</i></a></span><br>" +
                    parseMarkdown(a.content.replaceAll("\n", "<br>"));
                TYPES = ["info", "info", "warning", "criticle", "resolved"];
                banner = genBanner(TYPES[a.announcement_type], a.title, content);
                $("#anns").append(banner);
            }
        }
    });
    window.onscroll = function (ev) {
        if (curtab != "#AnnTab") return;
        if ((window.innerHeight + window.scrollY + 100) >= document.body.offsetHeight) {
            $.ajax({
                url: apidomain + "/" + vtcprefix + "/announcement?page=" + annpage,
                type: "GET",
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + token
                },
                success: async function (data) {
                    annpage += 1;
                    ann = data.response.list;
                    for (i = 0; i < ann.length; i++) {
                        a = ann[i];
                        dt = getDateTime(a.timestamp * 1000);
                        content = "<span style='font-size:10px;color:grey'><b>#" + a.announcementid + "</b> | <b>" + dt +
                            "</b> by <a style='cursor:pointer' onclick='LoadUserProfile(" + a.author.userid + ")'><i>" + a.author.name + "</i></a></span><br>" +
                            parseMarkdown(a.content.replaceAll("\n", "<br>"));
                        TYPES = ["info", "info", "warning", "criticle", "resolved"];
                        banner = genBanner(TYPES[a.announcement_type], a.title, content);
                        $("#anns").append(banner);
                        $($("#anns").children()[$("#anns").children().length - 1]).hide();
                        $($("#anns").children()[$("#anns").children().length - 1]).fadeIn();
                        await sleep(200);
                    }
                }
            });
        }
    };
}

function FetchAnnouncement() {
    aid = $("#annid").val();

    GeneralLoad();
    LockBtn("#fetchAnnouncementBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/announcement?announcementid=" + aid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#fetchAnnouncementBtn");
            if (data.error) return AjaxError(data);

            announcement = data.response;
            $("#anntitle").val(announcement.title);
            $("#anncontent").val(announcement.content);
            if (announcement.is_private) $("#annpvt-1").prop("checked", true);
            else $("#annpvt-0").prop("checked", true);
            $('#annselect option:eq(' + announcement.announcement_type + ')').prop('selected', true);
        },
        error: function (data) {
            UnlockBtn("#fetchAnnouncementBtn");
            AjaxError(data);
        }
    })
}

function AnnouncementOp() {
    anntype = parseInt($("#annselect").find(":selected").val());
    title = $("#anntitle").val();
    content = $("#anncontent").val();
    annid = $("#annid").val();
    pvt = $("#annpvt-1").prop("checked");
    chnid = $("#annchan").val().replaceAll(" ", "");

    if (chnid != "" && !isNumber(chnid)) {
        toastFactory("warning", "Error", "Channel ID must be an integar if specified!", 5000, false);
        return;
    }

    GeneralLoad();
    LockBtn("#newAnnBtn");

    op = "create";
    if (isNumber(annid)) {
        if (title != "" || content != "") {
            op = "update";
        } else {
            op = "delete";
        }
    }

    if (op == "update") {
        annid = parseInt(annid);
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/announcement?announcementid="+annid,
            type: "PATCH",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            data: {
                "title": title,
                "content": content,
                "announcement_type": anntype,
                "is_private": pvt,
                "channelid": chnid
            },
            success: function (data) {
                UnlockBtn("#newAnnBtn");
                if (data.error) AjaxError(data);
                toastFactory("success", "Success", "", 5000, false);
            },
            error: function (data) {
                UnlockBtn("#newAnnBtn");
                AjaxError(data);
            }
        });
    } else if (op == "create") {
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
                "is_private": pvt,
                "channelid": chnid,
                "discord_message_content": $("#annmsg").val()
            },
            success: function (data) {
                UnlockBtn("#newAnnBtn");
                if (data.error) AjaxError(data);
                toastFactory("success", "Success", "", 5000, false);
            },
            error: function (data) {
                UnlockBtn("#newAnnBtn");
                AjaxError(data);
            }
        });
    } else if (op == "delete") {
        annid = parseInt(annid);
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/announcement?announcementid=" + annid,
            type: "DELETE",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                UnlockBtn("#newAnnBtn");
                if (data.error) AjaxError(data);
                toastFactory("success", "Success", "", 5000, false);
            },
            error: function (data) {
                UnlockBtn("#newAnnBtn");
                AjaxError(data);
            }
        });
    }
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
            toastFactory("success", "Success", "Application submitted!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#submitAppBttn");
            AjaxError(data);
        }
    });
}
function LoadUserApplicationList(recurse = true) {
    GeneralLoad();

    page = parseInt($("#myapppage").val());
    if (page == "" || page == undefined || page <= 0) page = 1;

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/application/list?page=" + page + "&application_type=0",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            $("#myappTable").empty();
            applications = data.response.list;
            STATUS = ["Pending", "Accepted", "Declined"]
            if (applications.length == 0) {
                $("#myappTableHead").hide();
                $("#myappTable").append(TableNoData(5));
                $("#myapppage").val(1);
                if (recurse) LoadUserApplicationList(recurse = false);
                return;
            }
            $("#myappTableHead").show();
            totpage = Math.ceil(data.response.total_items / 10);
            if (page > totpage) {
                $("#myapppage").val(1);
                if (recurse) LoadUserApplicationList(recurse = false);
                return;
            }
            $("#myapptotpages").html(totpage);
            $("#myAppTableControl").children().remove();
            $("#myAppTableControl").append(`
            <button type="button" style="display:inline"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="$('#myapppage').val(1);LoadUserApplicationList();">1</button>`);
            if (page > 3) {
                $("#myAppTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            for (var i = Math.max(page - 1, 2); i <= Math.min(page + 1, totpage - 1); i++) {
                $("#myAppTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#myapppage').val(${i});LoadUserApplicationList();">${i}</button>`);
            }
            if (page < totpage - 2) {
                $("#myAppTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            if (totpage > 1) {
                $("#myAppTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#myapppage').val(${totpage});LoadUserApplicationList();">${totpage}</button>`);
            }

            for (i = 0; i < applications.length; i++) {
                application = applications[i];
                apptype = applicationTypes[application.application_type];
                creation = getDateTime(application.submit_timestamp * 1000);
                closedat = getDateTime(application.update_timestamp * 1000);
                if (application.update_timestamp == 0) {
                    closedat = "/";
                    console.log(closedat);
                }
                status = STATUS[application.status];

                color = "blue";
                if (application.status == 1) color = "lightgreen";
                if (application.status == 2) color = "red";

                $("#myappTable").append(`
            <tr class="text-sm">
              <td class="py-5 px-6 font-medium">${application.applicationid}</td>
              <td class="py-5 px-6 font-medium">${apptype}</td>
              <td class="py-5 px-6 font-medium">${creation}</td>
              <td class="py-5 px-6 font-medium" style="color:${color}">${status}</td>
              <td class="py-5 px-6 font-medium">${closedat}</td>
              <td class="py-5 px-6 font-medium">
              <button type="button" style="display:inline;padding:5px" id="MyAppBtn${application.applicationid}" 
              class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
              onclick="GetApplicationDetail(${application.applicationid})">Details</button></td>
            </tr>`);
            }
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function AddMessageToApplication() {
    appid = $("#appmsgid").val();
    if (!isNumber(appid)) {
        toastFactory("error", "Error:", "Please enter a valid application ID.", 5000, false);
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
            toastFactory("success", "Success!", "Message added!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#addAppMessageBtn");
            AjaxError(data);
        }
    });
}

function LoadAllApplicationList(recurse = true) {
    page = parseInt($('#allapppage').val());
    if (page == "" || page == undefined || page <= 0) page = 1;

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/application/list?page=" + page + "&application_type=0&all_user=1",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#allappTable").empty();
            $("#totpages").html(Math.ceil(data.response.total_items / 10));
            applications = data.response.list;
            STATUS = ["Pending", "Accepted", "Declined"];
            if (applications.length == 0) {
                $("#allappTableHead").hide();
                $("#allappTable").append(TableNoData(6));
                $("#allapppage").val(1);
                if (recurse) LoadAllApplicationList(recurse = false);
                return;
            }
            $("#allappTableHead").show();
            totpage = Math.ceil(data.response.total_items / 10);
            if (page > totpage) {
                $("#allapppage").val(1);
                if (recurse) LoadAllApplicationList(recurse = false);
                return;
            }
            $("#allapptotpages").html(totpage);
            $("#allAppTableControl").children().remove();
            $("#allAppTableControl").append(`
            <button type="button" style="display:inline"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="$('#allapppage').val(1);LoadAllApplicationList();">1</button>`);
            if (page > 3) {
                $("#allAppTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            for (var i = Math.max(page - 1, 2); i <= Math.min(page + 1, totpage - 1); i++) {
                $("#allAppTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#allapppage').val(${i});LoadAllApplicationList();">${i}</button>`);
            }
            if (page < totpage - 2) {
                $("#allAppTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            if (totpage > 1) {
                $("#allAppTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#allapppage').val(${totpage});LoadAllApplicationList();">${totpage}</button>`);
            }

            for (i = 0; i < applications.length; i++) {
                application = applications[i];
                apptype = applicationTypes[application.application_type];
                creation = getDateTime(application.submit_timestamp * 1000);
                closedat = getDateTime(application.update_timestamp * 1000);
                if (application.update_timestamp == 0) {
                    closedat = "/";
                    console.log(closedat);
                }
                status = STATUS[application.status];

                color = "blue";
                if (application.status == 1) color = "lightgreen";
                if (application.status == 2) color = "red";

                $("#allappTable").append(`
            <tr class="text-sm" id="AllApp${application.applicationid}">
              <td class="py-5 px-6 font-medium">${application.applicationid}</td>
              <td class="py-5 px-6 font-medium">${application.name}</td>
              <td class="py-5 px-6 font-medium">${apptype}</td>
              <td class="py-5 px-6 font-medium">${creation}</td>
              <td class="py-5 px-6 font-medium" style="color:${color}">${status}</td>
              <td class="py-5 px-6 font-medium">${closedat}</td>
              <td class="py-5 px-6 font-medium">
              <button type="button" style="display:inline;padding:5px" id="AllAppBtn${application.applicationid}" 
              class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
              onclick="GetApplicationDetail(${application.applicationid}, true)">Details</button></td>
            </tr>`);
            }
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
            discordid = data.response.discordid;
            keys = Object.keys(d);
            if (keys.length == 0)
                return toastFactory("error", "Error:", "Application has no data", 5000, false);
                
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
            toastFactory("success", "Application status updated.", data.response.message, 5000, false);
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
            toastFactory("success", "Success!", data.response.message, 5000, false);
        },
        error: function (data) {
            UnlockBtn("#updateStaffPositionBtn");
            AjaxError(data);
        }
    })
}
function loadDivisionList(){
    lastDivisionUpdate = parseInt(localStorage.getItem("divisionLastUpdate"));
    if (!isNumber(lastDivisionUpdate)) {
        lastDivisionUpdate = 0;
    }
    if (+new Date() - lastDivisionUpdate > 86400) {
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/division/list",
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
                d = data.response;
                localStorage.setItem("division", JSON.stringify(d));
                localStorage.setItem("divisionLastUpdate", + new Date());
                for (var i = 0; i < d.length; i++) {
                    $("#divisionList").append(
                        `<div class="md:w-1/2 lg:w-1/4 p-4 statscard" style="padding-top:0">
                            <div class="p-6 rounded bg-white">
                                <div class="mb-2">
                                    <h2 style="display:inline">${d[i].name}</h2>
                                    <div class="p-4 overflow-x-auto" style="display: block;max-height:60vh">
                                        <table class="table-auto w-full">
                                            <thead id="divisionTable${d[i].id}Head">
                                                <tr class="text-xs text-gray-500 text-left">
                                                    <th class="py-5 px-6 pb-3 font-medium">Name</th>
                                                    <th class="py-5 px-6 pb-3 font-medium">Points</th>
                                                </tr>
                                            </thead>
                                            <tbody id="divisionTable${d[i].id}">
                                                <tr class="text-sm">
                                                    <td class="py-5 px-6 font-medium">No Data</td>
                                                    <td class="py-5 px-6 font-medium"></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>`);
                }
            }
        })
    } else {
        d = localStorage.getItem("division");
        d = JSON.parse(d);
        for (var i = 0; i < d.length; i++) {
            $("#divisionList").append(
                `<div class="md:w-1/2 lg:w-1/4 p-4 statscard" style="padding-top:0">
                    <div class="p-6 rounded bg-white">
                        <div class="mb-2">
                            <h2 style="display:inline">${d[i].name}</h2>
                            <div class="p-4 overflow-x-auto" style="display: block;max-height:60vh">
                                <table class="table-auto w-full">
                                    <thead id="divisionTable${d[i].id}Head">
                                        <tr class="text-xs text-gray-500 text-left">
                                            <th class="py-5 px-6 pb-3 font-medium">Name</th>
                                            <th class="py-5 px-6 pb-3 font-medium">Points</th>
                                        </tr>
                                    </thead>
                                    <tbody id="divisionTable${d[i].id}">
                                        <tr class="text-sm">
                                            <td class="py-5 px-6 font-medium">No Data</td>
                                            <td class="py-5 px-6 font-medium"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>`);
        }
    }
}

function loadDivision() {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/division",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            d = data.response;
            info = d.statistics;
            for (var i = 0; i < info.length; i++) {
                divisionid = info[i].divisionid;
                divisionname = info[i].name;
                stats = info[i].drivers;
                tablename = "#divisionTable" + divisionid;
                $(tablename).empty();
                if (stats.length == 0) {
                    $(tablename).append(`
                <tr class="text-sm">
                  <td class="py-5 px-6 font-medium">No Data</td>
                  <td class="py-5 px-6 font-medium"></td>
                </tr>`);
                } else {
                    for (j = 0; j < stats.length; j++) {
                        $(tablename).append(`
                        <tr class="text-sm">
                        <td class="py-5 px-6 font-medium"><a style="cursor:pointer" onclick="LoadUserProfile(${stats[j].userid});">${stats[j].name}</a></td>
                        <td class="py-5 px-6 font-medium">${stats[j].points}</td>
                        </tr>`);
                    }
                }
            }

            $("#divisionDeliveryTable").empty();
            if (d.recent.length == 0) {
                $("#divisionDeliveryTableHead").hide();
                $("#divisionDeliveryTable").append(TableNoData(8));
            } else {
                $("#divisionDeliveryTableHead").show();
                for (i = 0; i < d.recent.length; i++) {
                    delivery = d.recent[i];
                    distance = TSeparator(parseInt(delivery.distance * distance_ratio));
                    cargo_mass = parseInt(delivery.cargo_mass / 1000) + "t";
                    unittxt = "€";
                    if (delivery.unit == 2) unittxt = "$";
                    profit = TSeparator(delivery.profit);
                    color = "";
                    if (delivery.profit < 0) color = "grey";
                    dextra = "<span title='Validated Division Delivery'>" + SVG_VERIFIED + "</span>";
                    $("#divisionDeliveryTable").append(`
            <tr class="text-sm" style="color:${color}">
              <td class="py-5 px-6 font-medium"><a style='cursor:pointer' onclick="deliveryDetail('${delivery.logid}')">${delivery.logid} ${dextra}</a></td>
              <td class="py-5 px-6 font-medium"><a style='cursor:pointer' onclick='LoadUserProfile(${delivery.userid})'>${delivery.name}</a></td>
              <td class="py-5 px-6 font-medium">${delivery.source_company}, ${delivery.source_city}</td>
              <td class="py-5 px-6 font-medium">${delivery.destination_company}, ${delivery.destination_city}</td>
              <td class="py-5 px-6 font-medium">${distance}${distance_unit_txt}</td>
              <td class="py-5 px-6 font-medium">${delivery.cargo} (${cargo_mass})</td>
              <td class="py-5 px-6 font-medium">${unittxt}${profit}</td>
            </tr>`);
                }
            }
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function loadStaffDivision() {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/division/list/pending",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            DIVISION = {};
            divisions = JSON.parse(localStorage.getItem("division"));
            for(var i = 0 ; i < divisions.length ; i++) {
                DIVISION[divisions[i].id] = divisions[i].name;
            }
            if(Object.keys(DIVISION).length == 0) return toastFactory("error", "Error:", "No division found.", 5000, false);
            $("#staffDisivionTable").empty();
            d = data.response;
            if (d.length == 0) {
                $("#staffDisivionTableHead").hide();
                $("#staffDisivionTable").append(TableNoData(3));
            } else {
                $("#staffDisivionTableHead").show();
                for (i = 0; i < d.length; i++) {
                    delivery = d[i];
                    $("#staffDisivionTable").append(`
            <tr class="text-sm">
            <td class="py-5 px-6 font-medium"><a onclick="deliveryDetail(${delivery.logid})" style="cursor:pointer">${delivery.logid}</a></td>
              <td class="py-5 px-6 font-medium"><a style='cursor:pointer' onclick='LoadUserProfile(${delivery.userid})'>${delivery.name}</a></td>
              <td class="py-5 px-6 font-medium">${DIVISION[delivery.divisionid]}</td>
              <td class="py-5 px-6 font-medium">
              <button type="button" style="display:inline;padding:5px" id="DeliveryInfoBtn${delivery.logid}" 
              class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
              onclick="deliveryDetail('${delivery.logid}')">Details</button></td>
            </tr>`);
                }
            }
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}
function GetDivisionInfo(logid) {
    GeneralLoad();
    LockBtn("#divisioninfobtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/division?logid=" + logid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            UnlockBtn("#divisioninfobtn");
            if (data.error) return AjaxError(data);

            info = `<div style="text-align:left">`;
            if (data.response.status == "-1") {
                divisionopt = "";
                divisions = JSON.parse(localStorage.getItem("division"));
                for(var i = 0 ; i < divisions.length ; i++) {
                    divisionopt += `<option value="${divisions[i].name.toLowerCase()}" id="division${divisions[i].id}">${divisions[i].name}</option>`;
                }
                if(divisionopt == "") return toastFactory("error", "Error:", "No division found.", 5000, false);
                info += `
                <h3 class="text-xl font-bold" style="text-align:left;margin:5px">Division: </h3>
                <select id="divisionSelect"
                  class="appearance-none block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                  name="field-name">
                  ${divisionopt}
                </select>`;
                info += `<button type="button" style="float:right" id="divisionRequestBtn"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="SubmitDivisionValidationRequest(${logid})">Request Division Validation</button>`;
                info += "</div>";
                Swal.fire({
                    title: `Division Delivery #` + logid,
                    html: info,
                    icon: 'info',
                    showConfirmButton: false,
                    confirmButtonText: 'Close'
                });
            } else if (data.response.user_is_staff == true && data.response.status == "0") {
                divisionopt = "";
                divisions = JSON.parse(localStorage.getItem("division"));
                for(var i = 0 ; i < divisions.length ; i++) {
                    divisionopt += `<option value="${divisions[i].name.toLowerCase()}" id="division${divisions[i].id}">${divisions[i].name}</option>`;
                }
                if(divisionopt == "") return toastFactory("error", "Error:", "No division found.", 5000, false);
                info += `
                <p>This delivery is pending division validation.</p>
                <p>The division is selected by driver and changeable.</p>
                <p>A short reason should be provided if you'd reject it.</p>
                <h3 class="text-xl font-bold" style="text-align:left;margin:5px">Division: </h3>
                <select id="divisionSelect"
                  class="appearance-none block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                  name="field-name">
                  ${divisionopt}
                </select>
                <h3 class="text-xl font-bold" style="text-align:left;margin:5px">Reason: </h3>
                <textarea id="divisionReason"
                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded" name="field-name"
                rows="5" placeholder=""></textarea>
                `;
                info += `<button type="button" style="float:right;background-color:green;margin:5px" id="divisionAcceptBtn"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="updateDivision(${logid}, 1)">Accept</button>`;
                info += `<button type="button" style="float:right;background-color:red;margin:5px" id="divisionRejectBtn"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="updateDivision(${logid}, 2)">Deny</button>`;
                info += "</div>";
                Swal.fire({
                    title: `Division Delivery #` + logid,
                    html: info,
                    icon: 'info',
                    showConfirmButton: false,
                    confirmButtonText: 'Close'
                });
                $("#division" + data.response.divisionid).prop("selected", true);
            } else {
                DIVISION = {};
                divisions = JSON.parse(localStorage.getItem("division"));
                for(var i = 0 ; i < divisions.length ; i++) {
                    DIVISION[divisions[i].id] = divisions[i].name;
                }
                if(Object.keys(DIVISION).length == 0) return toastFactory("error", "Error:", "No division found.", 5000, false);
                if (data.response.update_reason == undefined) {
                    info += "<p><b>Division</b>: " + DIVISION[data.response.divisionid] + "</p><br>";
                    info += "<p>Validated at " + getDateTime(parseInt(data.response.update_timestamp) * 1000) +
                        " by <a onclick='LoadUserProfile(" + data.response.update_staff.userid + ");'>" + data.response.update_staff.name + "</a></p>";
                } else {
                    info += "<p><b>Division</b>: " + DIVISION[data.response.divisionid] + "</p><br>";
                    info += "<p>Validation requested at " + getDateTime(data.response.request_timestamp * 1000) + "</p>";
                    if (data.response.status == "0") info += "<p>- Pending Validation</p>";
                    else if (data.response.status == "1")
                        info += "<p>Validated at " + getDateTime(parseInt(data.response.update_timestamp) * 1000) +
                        " by <a onclick='LoadUserProfile(" + data.response.update_staff.userid + ");'>" + data.response.update_staff.name + "</a></p>";
                    else if (data.response.status == "2")
                        info += "<p>Denied at " + getDateTime(data.response.update_timestamp * 1000) +
                        " by <a onclick='LoadUserProfile(" + data.response.update_staff.userid + ");'>" + data.response.update_staff.name + "</a></p>";
                    if (data.response.update_reason != "")
                        info += "<p> - For reason " + data.response.update_reason + "</p>";
                }
                if (data.response.user_is_staff == true) {
                    info += `<button type="button" style="float:right;background-color:grey;margin:5px" id="divisionAcceptBtn"
                    class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                    onclick="updateDivision(${logid}, 0)">Revalidate</button>`;
                }
                info += "</div>";
                Swal.fire({
                    title: `Division Delivery #` + logid,
                    html: info,
                    icon: 'info',
                    confirmButtonText: 'Close'
                });
            }
        },
        error: function (data) {
            if (data.error) return AjaxError(data);
            AjaxError(data);
        }
    });
}

function SubmitDivisionValidationRequest(logid) {
    GeneralLoad();
    LockBtn("#divisionRequestBtn");

    division = $("#divisionSelect").val();
    divisionid = "-1";
    divisions = JSON.parse(localStorage.getItem("division"));
    for(var i = 0 ; i < divisions.length ; i++) {
        if(divisions[i].name.toLowerCase() == division.toLowerCase()) {
            divisionid = divisions[i].id;
            break;
        }
    }
    if(divisionid == "-1") return toastFactory("error", "Error:", "Invalid division.", 5000, false);

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
            UnlockBtn("#divisionRequestBtn");
            if (data.error) return AjaxError(data);
            toastFactory("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            UnlockBtn("#divisionRequestBtn");
            AjaxError(data);
        }
    });
}

function updateDivision(logid, status) {
    GeneralLoad();
    if (status <= 1) {
        LockBtn("#divisionAcceptBtn");
        $("#divisionRejectBtn").attr("disabled", "disabled");
    } else if (status == 2) {
        LockBtn("#divisionRejectBtn");
        $("#divisionRejectBtn").attr("disabled", "disabled");
    }

    division = $("#divisionSelect").val();
    divisionid = "-1";
    divisions = JSON.parse(localStorage.getItem("division"));
    for(var i = 0 ; i < divisions.length ; i++) {
        if(divisions[i].name.toLowerCase() == division.toLowerCase()) {
            divisionid = divisions[i].id;
            break;
        }
    }
    if(divisionid == "-1") return toastFactory("error", "Error:", "Invalid division.", 5000, false);
    reason = $("#divisionReason").val();
    if (reason == undefined || reason == null) reason = "";
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
            reason: reason
        },
        success: function (data) {
            UnlockBtn("#divisionAcceptBtn");
            UnlockBtn("#divisionRejectBtn");
            if (data.error) return AjaxError(data);
            GetDivisionInfo(logid);
            toastFactory("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            UnlockBtn("#divisionAcceptBtn");
            UnlockBtn("#divisionRejectBtn");
            AjaxError(data);
        }
    });
}

function loadDownloads() {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/downloads",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            $("#downloads").html(parseMarkdown(data.response));
            $("#downloadscontent").val(data.response);
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function toggleUpdateDownloads() {
    $("#downloadsedit").toggle();
    $("#downloads").toggle();
}

function UpdateDownloads() {
    GeneralLoad();
    LockBtn("#saveDownloadsBtn");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/downloads",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "data": $("#downloadscontent").val()
        },
        success: function (data) {
            UnlockBtn("#saveDownloadsBtn");
            if (data.error) return AjaxError(data);
            $("#downloads").html(parseMarkdown($("#downloadscontent").val()));
            toastFactory("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            UnlockBtn("#saveDownloadsBtn");
            AjaxError(data);
        }
    })
}
function HandleAttendeeInput(){
    $('#attendeeId').keydown(function (e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode == 13) {
            val = $("#attendeeId").val();
            if (val == "") return;
            $.ajax({
                url: apidomain + "/" + vtcprefix + "/member/list?page=1&order_by=highest_role&order=desc&name=" + val,
                type: "GET",
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                success: function (data) {
                    d = data.response.list;
                    if (d.length == 0) {
                        return toastFactory("error", "Error:", "No member with name " + val + " found.", 5000, false);
                    }
                    userid = d[0].userid;
                    username = d[0].name;
                    if ($(`#attendeeid-${userid}`).length > 0) {
                        return toastFactory("error", "Error:", "Member already added.", 5000, false);
                    }
                    $("#attendeeId").before(`<span class='tag attendee' id='attendeeid-${userid}'>${username} (${userid})
                        <a style='cursor:pointer' onclick='$("#attendeeid-${userid}").remove()'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"> <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/> </svg> </a></span>`);
                    $("#attendeeId").val("");
                },
                error: function (data) {
                    return toastFactory("error", "Error:", "Failed to get User ID", 5000, false);
                }
            })
        } else if (keyCode == 8) {
            e.preventDefault();
            val = $("#attendeeId").val();
            if (val != "") {
                $("#attendeeId").val(val.substring(0, val.length - 1));
                return;
            }
            ch = $("#attendeeIdWrap").children();
            ch[ch.length - 2].remove();
        }
    });
}

function FetchEvent(showdetail = -1) {
    eventid = $("#eventid").val();
    if (!isNumber(eventid))
        return toastFactory("error", "Error", "Event ID must be in integar!", 5000, false);

    GeneralLoad();
    LockBtn("#fetchEventBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/event?eventid=" + eventid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#fetchEventBtn");
            if (data.error) return AjaxError(data);

            event = data.response;
            allevents[event.eventid] = event;
            $("#eventtitle").val(event.title);
            $("#eventtruckersmp_link").val(event.truckersmp_link);
            $("#eventfrom").val(event.departure);
            $("#eventto").val(event.destination);
            $("#eventdistance").val(event.distance);
            offset = (+new Date().getTimezoneOffset()) * 60 * 1000;
            $("#eventmeetup_timestamp").val(new Date(event.meetup_timestamp * 1000 - offset).toISOString().substring(0, 16));
            $("#eventdeparture_timestamp").val(new Date(event.departure_timestamp * 1000 - offset).toISOString().substring(0, 16));
            imgs = "";
            for (let i = 0; i < event.images.length; i++) {
                imgs += event.images[i] + "\n";
            }
            if (event.is_private) $("#eventpvt-1").prop("checked", true);
            else $("#eventpvt-0").prop("checked", true);
            $("#eventimgs").val(imgs);

            if (showdetail != -1) eventDetail(showdetail);
        },
        error: function (data) {
            UnlockBtn("#fetchEventBtn");
            AjaxError(data);
        }
    })
}

function FetchEventAttendee() {
    eventid = $("#aeventid").val();
    if (!isNumber(eventid)) {
        return toastFactory("error", "Error", "Event ID must be in integar!", 5000, false);
    }

    GeneralLoad();
    LockBtn("#fetchEventAttendeeBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/event?eventid=" + eventid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#fetchEventAttendeeBtn");
            if (data.error) return AjaxError(data);

            event = data.response;
            $(".attendee").remove();
            for (let i = 0; i < event.attendees.length; i++) {
                userid = event.attendees[i].userid;
                username = event.attendees[i].name;
                if (userid == "") continue;
                $("#attendeeId").before(`<span class='tag attendee' id='attendeeid-${userid}'>${username} (${userid})
                <a style='cursor:pointer' onclick='$("#attendeeid-${userid}").remove()'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"> <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/> </svg> </a></span>`);
            }
        },
        error: function (data) {
            UnlockBtn("#fetchEventAttendeeBtn");
            AjaxError(data);
        }
    })
}

function UpdateEventAttendees() {
    eventid = $("#aeventid").val();
    if (!isNumber(eventid)) {
        return toastFactory("error", "Error", "Event ID must be in integar!", 5000, false);
    }
    attendeeid = "";
    $(".attendee").each(function (index, value) {
        attendeeid += $(value).prop('id').replaceAll("attendeeid-", "") + ",";
    })
    attendeeid = attendeeid.substring(0, attendeeid.length - 1);
    points = $("#attendeePoints").val();
    if (!isNumber(points)) {
        return toastFactory("error", "Error", "Points must be in integar!", 5000, false);
    }

    GeneralLoad();
    LockBtn("#attendeeBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/event/attendee?eventid=" + eventid,
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "attendees": attendeeid,
            "points": points
        },
        success: function (data) {
            UnlockBtn("#attendeeBtn");
            if (data.error) return AjaxError(data);
            
            Swal.fire({
                title: 'Event Attendees Updated!',
                html: "<p style='text-align:left'>" + data.response.message.replaceAll("\n", "<br>") + "</p>",
                icon: 'success',
                confirmButtonText: 'OK'
            })
            loadEvent();
        },
        error: function (data) {
            $("#attendeeBtn").html("Update");
            $("#attendeeBtn").removeAttr("disabled");
            AjaxError(data);
        }
    })
}

function EventOp() {
    title = $("#eventtitle").val();
    truckersmp_link = $("#eventtruckersmp_link").val();
    from = $("#eventfrom").val();
    to = $("#eventto").val();
    distance = $("#eventdistance").val();
    meetup_timestamp = +new Date($("#eventmeetup_timestamp").val());
    departure_timestamp = +new Date($("#eventdeparture_timestamp").val());
    meetup_timestamp /= 1000;
    departure_timestamp /= 1000;
    eventid = $("#eventid").val();
    pvt = $("#eventpvt-1").prop("checked");
    img = $("#eventimgs").val().replaceAll("\n", ",");

    GeneralLoad();
    LockBtn("#newEventBtn");

    op = "create";
    if (isNumber(eventid)) {
        if (title != "" || from != "" || to != "" || distance != "") {
            op = "update";
        } else {
            op = "delete";
        }
    }

    if (op == "update") {
        eventid = parseInt(eventid);
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/event?eventid=" + eventid,
            type: "PATCH",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            data: {
                "title": title,
                "truckersmp_link": truckersmp_link,
                "departure": from,
                "destination": to,
                "distance": distance,
                "meetup_timestamp": meetup_timestamp,
                "departure_timestamp": departure_timestamp,
                "images": img,
                "is_private": pvt
            },
            success: function (data) {
                UnlockBtn("#newEventBtn");
                if (data.error) return AjaxError(data);
                toastFactory("success", "Success", "", 5000, false);
            },
            error: function (data) {
                UnlockBtn("#newEventBtn");
                AjaxError(data);
            }
        });
    } else if (op == "create") {
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/event",
            type: "POST",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            data: {
                "title": title,
                "truckersmp_link": truckersmp_link,
                "departure": from,
                "destination": to,
                "distance": distance,
                "meetup_timestamp": meetup_timestamp,
                "departure_timestamp": departure_timestamp,
                "images": img,
                "is_private": pvt
            },
            success: function (data) {
                UnlockBtn("#newEventBtn");
                if (data.error) return AjaxError(data);
                toastFactory("success", "Success", "", 5000, false);
            },
            error: function (data) {
                UnlockBtn("#newEventBtn");
                AjaxError(data);
            }
        });
    } else if (op == "delete") {
        annid = parseInt(annid);
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/event?eventid=" + eventid,
            type: "DELETE",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                UnlockBtn("#newEventBtn");
                if (data.error) return AjaxError(data);
                toastFactory("success", "Success", "", 5000, false);
            },
            error: function (data) {
                UnlockBtn("#newEventBtn");
                AjaxError(data);
            }
        });
    }
}

allevents = {};

function loadEvent(recurse = true) {
    page = parseInt($("#epages").val())
    if (page == "" || page == undefined || page <= 0) page = 1;

    if (eventsCalendar == undefined) {
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/event/all",
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: async function (data) {
                if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
                d = data.response.list;
                var eventlist = [];
                offset = (+new Date().getTimezoneOffset()) * 60 * 1000;
                for (var i = 0; i < d.length; i++) {
                    eventlist.push({
                        "title": d[i].title,
                        "url": "/event?eventid=" + d[i].eventid,
                        "start": new Date(d[i].meetup_timestamp * 1000 - offset).toISOString().substring(0, 10)
                    })
                }

                setTimeout(async function () {
                    while ($("#loading").width() != 0) await sleep(50);
                    var eventsCalendarEl = document.getElementById('eventsCalendar');
                    var eventsCalendar = new FullCalendar.Calendar(eventsCalendarEl, {
                        initialView: 'dayGridMonth',
                        headerToolbar: {
                            left: 'prev,next today',
                            center: 'title'
                        },
                        eventClick: function (info) {
                            info.jsEvent.preventDefault();
                            eventid = parseInt(info.event.url.split("=")[1]);
                            eventDetail(eventid);
                        },
                        events: eventlist,
                        height: 'auto'
                    });
                    eventsCalendar.render();
                    setInterval(function () {
                        $(".fc-daygrid-event").removeClass("fc-daygrid-event");
                    }, 500);
                }, 50);
            },
            error: function (data) {
                AjaxError(data);
            }
        })
    }

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/event?page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            $("#eventTable").empty();
            events = data.response.list;
            if (events.length == 0) {
                $("#eventTableHead").hide();
                $("#eventTable").append(TableNoData(8));
                $("#epages").val(1);
                if (recurse) loadEvent(recurse = false);
                return;
            }
            $("#eventTableHead").show();
            totpage = Math.ceil(data.response.total_items / 10);
            if (page > totpage) {
                $("#epages").val(1);
                if (recurse) loadEvent(recurse = false);
                return;
            }
            $("#etotpages").html(totpage);
            $("#eventTableControl").children().remove();
            $("#eventTableControl").append(`
            <button type="button" style="display:inline"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="$('#epages').val(1);loadEvent();">1</button>`);
            if (page > 3) {
                $("#eventTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            for (var i = Math.max(page - 1, 2); i <= Math.min(page + 1, totpage - 1); i++) {
                $("#eventTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#epages').val(${i});loadEvent();">${i}</button>`);
            }
            if (page < totpage - 2) {
                $("#eventTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            if (totpage > 1) {
                $("#eventTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#epages').val(${totpage});loadEvent();">${totpage}</button>`);
            }

            for (i = 0; i < events.length; i++) {
                event = events[i];
                allevents[event.eventid] = event;
                meetup_timestamp = event.meetup_timestamp * 1000;
                departure_timestamp = event.departure_timestamp * 1000;
                now = +new Date();
                if (now >= meetup_timestamp - 1000 * 60 * 60 * 6) color = "blue";
                if (now >= meetup_timestamp && now <= departure_timestamp + 1000 * 60 * 30) color = "lightgreen"
                if (now > departure_timestamp + 1000 * 60 * 30) color = "grey";
                mt = getDateTime(meetup_timestamp);
                dt = getDateTime(departure_timestamp);
                votecnt = event.votes.length;
                pvt = "";
                if (event.is_private) pvt = SVG_LOCKED;
                $("#eventTable").append(`
            <tr class="text-sm" style="color:${color}">
              <td class="py-5 px-6 font-medium">${event.eventid} ${pvt}</td>
              <td class="py-5 px-6 font-medium">${event.title}</td>
              <td class="py-5 px-6 font-medium">${event.departure}</td>
              <td class="py-5 px-6 font-medium">${event.destination}</td>
              <td class="py-5 px-6 font-medium">${event.distance}</td>
              <td class="py-5 px-6 font-medium">${mt}</td>
              <td class="py-5 px-6 font-medium">${dt}</td>
              <td class="py-5 px-6 font-medium">${votecnt}</td>
              <td class="py-5 px-6 font-medium">
              <button type="button" style="display:inline;padding:5px"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="eventDetail('${event.eventid}')">Details</button></td>
            </tr>`);
            }
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function eventvote(eventid) {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/event/vote?eventid=" + eventid,
        type: "PUT",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            $("#eventid").val(eventid);
            FetchEvent(eventid, showdetail = eventid);
            toastFactory("success", "Success:", data.response, 5000, false);
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

async function eventDetail(eventid) {
    keys = Object.keys(allevents);
    if (keys.indexOf(String(eventid)) == -1) {
        $("#eventid").val(eventid);
        GeneralLoad();
        FetchEvent();
        while ($.active > 0) {
            await sleep(50);
        }
        keys = Object.keys(allevents);
        if (keys.indexOf(String(eventid)) == -1) {
            return toastFactory("error", "Error:", "Event not found.", 5000, false);
        }
    }
    event = allevents[eventid];
    voteop = `<a style="cursor:pointer;color:grey" onclick="eventvote(${eventid})">(Vote)</a>`;
    console.log(event);
    vote = "";
    userid = localStorage.getItem("userid");
    for (i = 0; i < event.votes.length; i++) {
        vote += event.votes[i].name + " ";
        if (event.votes[i].userid == String(userid)) {
            voteop = `<a style="cursor:pointer;color:grey" onclick="eventvote(${eventid})">(Unvote)</a>`;
        }
    }
    votecnt = event.votes.length;
    info = `<div style="text-align:left">`;
    info += "<p><b>Event ID</b>: " + event.eventid + "</p>";
    info += "<p><b>From</b>: " + event.departure + "</p>";
    info += "<p><b>To</b>: " + event.destination + "</p>";
    info += "<p><b>Distance</b>: " + event.distance + "</p>";
    info += "<p><b>Meetup Time</b>: " + getDateTime(event.meetup_timestamp * 1000) + "</p>";
    info += "<p><b>Departure Time</b>: " + getDateTime(event.departure_timestamp * 1000) + "</p>";
    info += "<p><b>Voted (" + votecnt + ")</b>: " + voteop + " " + vote + "</p>";
    info += "<p><b>Attendees</b>: " + event.attendee + "</p>";
    for (var i = 0; i < event.images.length; i++) {
        info += "<img src='" + event.images[i] + "' style='width:100%'/>";
    }
    info += "</div>";
    Swal.fire({
        title: `<a href='${event.truckersmp_link}' target='_blank'>${event.title}</a>`,
        html: info,
        icon: 'info',
        confirmButtonText: 'Close'
    });
}
drivershub = `    ____       _                         __  __      __  
   / __ \\_____(_)   _____  __________   / / / /_  __/ /_ 
  / / / / ___/ / | / / _ \\/ ___/ ___/  / /_/ / / / / __ \\
 / /_/ / /  / /| |/ /  __/ /  (__  )  / __  / /_/ / /_/ /
/_____/_/  /_/ |___/\\___/_/  /____/  /_/ /_/\\__,_/_.___/ 
                                                         `
console.log(drivershub);
console.log("Drivers Hub: Frontend (v1.5.1)");
console.log("Copyright (C) 2022 CharlesWithC All rights reserved.");
console.log('This product must work with "Drivers Hub: Backend" which is also made by CharlesWithC!');

SVG_VERIFIED = `<svg style="display:inline;position:relative;top:-1.5px;color:skyblue" width="18" height="18" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M10.5213 2.62368C11.3147 1.75255 12.6853 1.75255 13.4787 2.62368L14.4989 3.74391C14.8998 4.18418 15.4761 4.42288 16.071 4.39508L17.5845 4.32435C18.7614 4.26934 19.7307 5.23857 19.6757 6.41554L19.6049 7.92905C19.5771 8.52388 19.8158 9.10016 20.2561 9.50111L21.3763 10.5213C22.2475 11.3147 22.2475 12.6853 21.3763 13.4787L20.2561 14.4989C19.8158 14.8998 19.5771 15.4761 19.6049 16.071L19.6757 17.5845C19.7307 18.7614 18.7614 19.7307 17.5845 19.6757L16.071 19.6049C15.4761 19.5771 14.8998 19.8158 14.4989 20.2561L13.4787 21.3763C12.6853 22.2475 11.3147 22.2475 10.5213 21.3763L9.50111 20.2561C9.10016 19.8158 8.52388 19.5771 7.92905 19.6049L6.41553 19.6757C5.23857 19.7307 4.26934 18.7614 4.32435 17.5845L4.39508 16.071C4.42288 15.4761 4.18418 14.8998 3.74391 14.4989L2.62368 13.4787C1.75255 12.6853 1.75255 11.3147 2.62368 10.5213L3.74391 9.50111C4.18418 9.10016 4.42288 8.52388 4.39508 7.92905L4.32435 6.41553C4.26934 5.23857 5.23857 4.26934 6.41554 4.32435L7.92905 4.39508C8.52388 4.42288 9.10016 4.18418 9.50111 3.74391L10.5213 2.62368Z" stroke="currentColor" stroke-width="1.5"/> <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/> </svg> `;
SVG_LOCKED = `<svg style="display:inline;position:relative;top:-1.5px;color:red" xmlns="http://www.w3.org/2000/svg" width="18" height="18" enable-background="new 0 0 24 24" viewBox="0 0 24 24"><path d="M17,9V7c0-2.8-2.2-5-5-5S7,4.2,7,7v2c-1.7,0-3,1.3-3,3v7c0,1.7,1.3,3,3,3h10c1.7,0,3-1.3,3-3v-7C20,10.3,18.7,9,17,9z M9,7c0-1.7,1.3-3,3-3s3,1.3,3,3v2H9V7z M13,17c0,0.6-0.4,1-1,1s-1-0.4-1-1v-3c0-0.6,0.4-1,1-1s1,0.4,1,1V17z" fill="red"/></svg>`;

userid = localStorage.getItem("userid");
token = localStorage.getItem("token");
isAdmin = false;
highestrole = 99999;
roles = JSON.parse(localStorage.getItem("roles"));
rolelist = JSON.parse(localStorage.getItem("rolelist"));
perms = JSON.parse(localStorage.getItem("perms"));
positions = localStorage.getItem("positions");
applicationTypes = localStorage.getItem("applicationTypes");

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
            window.location.href = "/login";
        },
        error: function (data) {
            localStorage.removeItem("token");
            window.location.href = "/login";
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
            ranktable += `</tbody>/table>`;
            $("#ranktable").append(ranktable);
        }
    }
}

function InitResizeHandler(){
    setInterval(function () {
        if ($("#HomeTab").width() / 3 <= 300) {
            if ($("#HomeTab").width() / 2 <= 300) $(".statscard").css("width", "100%");
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
        if (e.which == 13) loadLeaderboard();
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
        $("#Division" + value).show();
    });
}

function InitDistanceUnit() {
    distance_unit = localStorage.getItem("distance_unit");
    if (distance_unit == "imperial") {
        $(".distance_unit").html("Mi");
        distance_unit_txt = "Mi";
        fuel_unit_txt = "Gal";
        weight_unit_txt = "Lb";
        distance_ratio = 0.621371;
        fuel_ratio = 0.2641720524;
        weight_ratio = 2.2046226218488;
        $("#imperialbtn").css("background-color", "none");
        $("#metricbtn").css("background-color", "#293039");
    } else {
        $(".distance_unit").html("Km");
        distance_unit = "metric";
        distance_unit_txt = "Km";
        fuel_unit_txt = "L";
        weight_unit_txt = "Lb";
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
    isdark = parseInt(localStorage.getItem("darkmode"));
    if (localStorage.getItem("darkmode") == undefined) isdark = 1;

    if (localStorage.getItem("darkmode") == "1") {
        $("body").addClass("bg-gray-800");
        $("body").css("color", "white");
        $("head").append(`<style id='convertbg'>
            h1,h2,h3,p,span,text,label,input,textarea,select,tr {color: white;}
            .text-gray-500,.text-gray-600 {color: #ddd;}
            .bg-white {background-color: rgba(255, 255, 255, 0.1);}
            .swal2-popup {background-color: rgb(41 48 57)}
            .rounded-full {background-color: #888}
            th > .fc-scrollgrid-sync-inner {background-color: #444}
            a:hover {color: white}
            a {color: #ccc}</style>`);
        $("#todarksvg").hide();
        $("#tolightsvg").show();
        Chart.defaults.color = "white";
        $("body").html($("body").html().replaceAll("text-green", "text-temp"));
        $("body").html($("body").html().replaceAll("#382CDD", "skyblue").replaceAll("green", "lightgreen"));
        $("body").html($("body").html().replaceAll("text-temp", "text-green"));
    } else {
        $("head").append(`<style>.rounded-full {background-color: #ddd}</style>`);
    }
}

function ToggleDarkMode() {
    if (!isdark) {
        $("body").css("transition", "color 1000ms linear");
        $("body").css("transition", "background-color 1000ms linear");
        $("body").addClass("bg-gray-800");
        $("body").css("color", "white");
        $("head").append(`<style id='convertbg'>
            h1,h2,h3,p,span,text,label,input,textarea,select,tr {color: white;transition: color 1000ms linear;}
            svg{transition: color 1000ms linear;}
            .text-gray-500,.text-gray-600 {color: #ddd;transition: color 1000ms linear;}
            .bg-white {background-color: rgba(255, 255, 255, 0.2);transition: background-color 1000ms linear;}
            .swal2-popup {background-color: rgb(41 48 57)}
            .rounded-full {background-color: #888;}
            a:hover {color: white}
            a: {color: #444}</style>`);
        $("#todarksvg").hide();
        $("#tolightsvg").show();
        Chart.defaults.color = "white";
        $("body").html($("body").html().replaceAll("text-green", "text-temp"));
        $("body").html($("body").html().replaceAll("#382CDD", "skyblue").replaceAll("green", "lightgreen"));
        $("body").html($("body").html().replaceAll("text-temp", "text-green"));
    } else {
        $("body").css("transition", "color 1000ms linear");
        $("body").css("transition", "background-color 1000ms linear");
        $("body").removeClass("bg-gray-800");
        $("body").css("color", "");
        $("head").append(`<style id='convertbg2'>
            h1,h2,h3,p,span,text,label,input,textarea,select,tr {transition: color 1000ms linear;}
            svg{transition: color 1000ms linear;}
            .text-gray-500,.text-gray-600 {transition: color 1000ms linear;}
            .bg-white {background-color: white;transition: background-color 1000ms linear;}
            .swal2-popup {background-color: white;}
            .rounded-full {background-color: #ddd;}
            a:hover {color: black}
            a {color: #ccc}</style>`);
        setTimeout(function () {
            $("#convertbg2").remove();
        }, 1000);
        $("#convertbg").remove();
        $("#todarksvg").show();
        $("#tolightsvg").hide();
        Chart.defaults.color = "black";
        $("body").html($("body").html().replaceAll("skyblue", "#382CDD").replaceAll("lightgreen", "green"));
    }
    isdark = 1 - isdark;
    localStorage.setItem("darkmode", isdark);
    LoadStats();
}

function InitSearchByName(){
    lastnamesearch = 0;
    lnsto = 0;

    function SearchName(eid) {
        if ($("#" + eid + "_datalist").length == 0) {
            $("#" + eid).attr("list", eid + "_datalist");
            $("#" + eid).after("<datalist id='" + eid + "_datalist'></datalist>");
        }
        datalist = "#" + eid + "_datalist";
        content = $("#" + eid).val();
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/member/list?page=1&order_by=highest_role&order=desc&name=" + content,
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                d = data.response.list;
                $(datalist).children().remove();
                if (d.length == 0) {
                    $(datalist).append("<option value='No Data'>");
                    return;
                }
                for (var i = 0; i < d.length; i++) {
                    $(datalist).append("<option value='" + d[i].name + "' id='" + eid + "_datalist_" + d[i].userid + "'>");
                }
            }
        });
    }
    $(".search-name").on('input', function () {
        if (+new Date() - lastnamesearch < 1000) return;
        lastnamesearch = +new Date();
        eid = $(this).attr("id");
        SearchName(eid);
        clearTimeout(lnsto);
        lnsto = setTimeout(function () {
            SearchName(eid)
        }, 1000);
    });
}

eventsCalendar = undefined;
curtab = "#HomeTab";
loadworking = false;
async function GeneralLoad() {
    if (loadworking) return;
    loadworking = true;
    if (isdark) $("#loading").css("border", "solid lightgreen 1px");
    else $("#loading").css("border", "solid green 1px");
    $("#loading").css("width", "50%");
    maxajax = 0;
    lastw = 0;
    while ($.active > 0) {
        maxajax = Math.max($.active + 1, maxajax);
        neww = parseInt(100 - $.active / maxajax * 100);
        while (neww > lastw) {
            lastw += 1;
            $("#loading").css("width", `${lastw}%`);
            await sleep(5);
        }
        await sleep(10);
    }
    neww = 100;
    while (neww > lastw) {
        lastw += 1;
        $("#loading").css("width", `${lastw}%`);
        await sleep(5);
    }
    neww = 1;
    while (neww < lastw) {
        lastw -= 5;
        $("#loading").css("width", `${lastw}%`);
        await sleep(1);
    }
    $("#loading").css("border", "solid transparent 1px");
    loadworking = false;
}

async function ShowTab(tabname, btnname) {
    loadworking = true;
    $("html, body").animate({
        scrollTop: 0
    }, "slow");
    curtab = tabname;
    clearInterval(dmapint);
    dmapint = -1;
    $("#map,#dmap,#pmap,#amap").children().remove();
    setTimeout(function(){ $(".tabs").hide(); $(tabname).show();},3000);// load timeout, in case of js error
    setTimeout(async function () {
        if (isdark) $("#loading").css("border", "solid lightgreen 1px");
        else $("#loading").css("border", "solid green 1px");
        $("#loading").css("width", "50%");
        maxajax = 0;
        lastw = 0;
        while ($.active > 0) {
            maxajax = Math.max($.active + 1, maxajax);
            neww = parseInt(100 - $.active / maxajax * 100);
            while (neww > lastw) {
                lastw += 1;
                $("#loading").css("width", `${lastw}%`);
                await sleep(5);
            }
            await sleep(10);
        }
        neww = 100;
        while (neww > lastw) {
            lastw += 1;
            $("#loading").css("width", `${lastw}%`);
            await sleep(5);
        }
        if (tabname == curtab) { // in case user switch tab too fast
            $(".tabs").hide();
            $(tabname).show();
        }
        neww = 1;
        while (neww < lastw) {
            lastw -= 5;
            $("#loading").css("width", `${lastw}%`);
            await sleep(1);
        }
        if (curtab != "#Event") {
            eventsCalendar = undefined;
            $("#eventsCalendar").children().remove();
            $("#eventsCalendar").attr("class", "");
        }
        $("#loading").css("border", "solid transparent 1px");
        loadworking = false;
    }, 10);
    $(".tabbtns").removeClass("bg-indigo-500");
    if (btnname != "#ProfileTabBtn") {
        $(btnname).addClass("bg-indigo-500");
    }
    if (tabname == "#Map") {
        window.history.pushState("", "", '/map');
        window.autofocus["map"] = -2;
        window.autofocus["amap"] = -2;
        window.autofocus["pmap"] = -2;
        setTimeout(async function () {
            while ($("#loading").width() != 0) await sleep(50);
            LoadETS2Map();
            LoadETS2PMap();
            LoadATSMap();
        }, 50);
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
    if (tabname == "#HomeTab") {
        window.history.pushState("", "", '/');
        LoadStats();
    }
    if (tabname == "#AnnTab") {
        window.history.pushState("", "", '/announcement');
        ch = $("#anns").children();
        ch.hide();
        for (var i = 0; i < ch.length; i++) {
            $(ch[i]).fadeIn();
            await sleep(200);
        }
    }
    if (tabname == "#StaffAnnTab") {
        window.history.pushState("", "", '/staff/announcement');
    }
    if (tabname == "#DownloadsTab") {
        window.history.pushState("", "", '/downloads');
        loadDownloads();
    }
    if (tabname == "#SubmitApp") {
        window.history.pushState("", "", '/application/submit');
        $("#driverappsel").attr("selected", "selected");
    }
    if (tabname == "#MyApp") {
        window.history.pushState("", "", '/application/my');
        LoadUserApplicationList();
    }
    if (tabname == "#AllApp") {
        window.history.pushState("", "", '/application/all');
        LoadAllApplicationList();
    }
    if (tabname == "#AllUsers") {
        window.history.pushState("", "", '/staff/user');
        LoadUserList();
    }
    if (tabname == "#AllMembers") {
        window.history.pushState("", "", '/member');
        LoadMemberList();
    }
    if (tabname == "#StaffMembers") {
        window.history.pushState("", "", '/staff/member');
        LoadMemberList();
    }
    if (tabname == "#Delivery") {
        window.history.pushState("", "", '/delivery');
        LoadDriverLeaderStatistics();
        LoadStats(true);
        LoadDeliveryList();
    }
    if (tabname == "#Leaderboard") {
        window.history.pushState("", "", '/leaderboard');
        loadLeaderboard();
    }
    if (tabname == "#Ranking") {
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
                    rank = point2rank(d.total_no_limit);
                    $("#ranktotpoints").html(TSeparator(d.total_no_limit) + " - " + rank);
                    if ($("#role").html() == "Driver")
                        $("#role").html(rank);
                }
            }
        });
    }
    if (tabname == "#Division") {
        window.history.pushState("", "", '/division');
        loadDivision();
    }
    if (tabname == "#StaffDivision") {
        window.history.pushState("", "", '/staff/division');
        loadStaffDivision();
    }
    if (tabname == "#Event") {
        window.history.pushState("", "", '/event');
        loadEvent();
        HandleAttendeeInput();
    }
    if (tabname == "#StaffEvent") {
        window.history.pushState("", "", '/staff/event');
        loadEvent();
    }
    if (tabname == "#AuditLog") {
        window.history.pushState("", "", '/audit');
        LoadAuditLog();
    }
    if (tabname == "#Admin") {
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
    $("#role").html(hrole);
    roleids = Object.keys(rolelist);
    for (var i = 0; i < roleids.length; i++) {
        roleids[i] = parseInt(roleids[i]);
    }
    ShowStaffTabs();
    for (var i = 0; i < roleids.length; i++) {
        if (roleids[i] <= highestrole)
            $("#rolelist").append(`<li><input disabled type="checkbox" id="role` + roleids[i] +
                `" name="assignrole" value="role` + roleids[i] + `">
<label for="role` + roleids[i] + `">` + rolelist[roleids[i]] + `</label></li>`);
        else
            $("#rolelist").append(`<li><input type="checkbox" id="role` + roleids[i] +
                `" name="assignrole" value="role` + roleids[i] + `">
<label for="role` + roleids[i] + `">` + rolelist[roleids[i]] + `</label></li>`);
    }                
}

function LoadCache(){
    if (positions != undefined && positions != null) {
        positions = JSON.parse(positions);
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
    if (!isNumber(cacheExpire)) cacheExpire = 0;
    if (cacheExpire <= +new Date()) {
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/application/positions",
            type: "GET",
            dataType: "json",
            success: function (data) {
                positions = data.response;
                positionstxt = "";
                for (var i = 0; i < positions.length; i++) {
                    positionstxt += positions[i] + "\n";
                    $("#application2Answer3").append("<option value='" + positions[i].replaceAll("'", "\\'") + "'>" + positions[i] + "</option>");
                }
                positionstxt = positionstxt.slice(0, -1);
                $("#staffposedit").val(positionstxt);
                localStorage.setItem("positions", JSON.stringify(positions));
            }
        });
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/member/perms",
            type: "GET",
            dataType: "json",
            success: function (data) {
                perms = data.response;
                localStorage.setItem("perms", JSON.stringify(perms));
                ShowStaffTabs();
            }
        });
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/member/roles",
            type: "GET",
            dataType: "json",
            success: function (data) {
                rolelist = data.response;
                UpdateRolesOnDisplay();
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
                localStorage.setItem("applicationTypes", JSON.stringify(d));
            }
        });
        localStorage.setItem("cacheExpire", +new Date() + 86400);
    }
}

function AnnouncementEventButtonValueUpdate() {
    setInterval(function () {
        title = $("#anntitle").val();
        content = $("#anncontent").val();
        annid = $("#annid").val();
        if (!$("#newAnnBtn").prop("disabled")) {
            if (isNumber(annid)) {
                if (title != "" || content != "") {
                    $("#newAnnBtn").html("Update Announcement");
                    $("#newAnnBtn").css("background-color", "lightgreen");
                } else {
                    $("#newAnnBtn").html("Delete Announcement");
                    $("#newAnnBtn").css("background-color", "red");
                }
            } else {
                $("#newAnnBtn").html("Create Announcement");
                $("#newAnnBtn").css("background-color", "blue");
            }
        } else {
            $("#newAnnBtn").html("Working...");
        }
    }, 100);
    setInterval(function () {
        title = $("#eventtitle").val();
        from = $("#eventfrom").val();
        to = $("#eventto").val();
        distance = $("#eventdistance").val();
        meetup_timestamp = $("#eventmeetup_timestamp").val();
        departure_timestamp = $("#eventdeparture_timestamp").val();
        eventid = $("#eventid").val();
        if (!$("#newEventBtn").prop("disabled")) {
            if (isNumber(eventid)) {
                if (title != "" || from != "" || to != "" || distance != "" || meetup_timestamp != "" || departure_timestamp != "") {
                    $("#newEventBtn").html("Update Event");
                    $("#newEventBtn").css("background-color", "lightgreen");
                } else {
                    $("#newEventBtn").html("Delete Event");
                    $("#newEventBtn").css("background-color", "red");
                }
            } else {
                $("#newEventBtn").html("Create Event");
                $("#newEventBtn").css("background-color", "blue");
            }
        } else {
            $("#newEventBtn").html("Working...");
        }
    }, 100);
}

function GetUserPermission(){
    if(roles == undefined || perms.admin == undefined) return;
    userPerm = [];
    for (i = 0; i < roles.length; i++) {
        for (j = 0; j < Object.keys(perms).length; j++) {
            if (["driver", "staff_of_the_month", "driver_of_the_month"].includes(Object.keys(perms)[j])) continue;
            for (k = 0; k < perms[Object.keys(perms)[j]].length; k++) {
                if (perms[Object.keys(perms)[j]][k] == roles[i]) {
                    userPerm.push(Object.keys(perms)[j]);
                }
            }
        }
    }
    return userPerm;
}

function ShowStaffTabs() {
    userPerm = GetUserPermission();
    if (userPerm.length > 0) {
        $("#stafftabs").show();
        $("#stafftabs a").hide();
        if (userPerm.includes("admin")) {
            $("#stafftabs a").show();
            $(".admin-only").show();
            $("#AdminBtn").show();
            AnnouncementEventButtonValueUpdate();
        } else {
            $(".admin-only").hide();
            if (userPerm.includes("event")) {
                $("#StaffEventBtn").show();
                $("#StaffAnnTabBtn").show();
                AnnouncementEventButtonValueUpdate();
            }
            if (userPerm.includes("hr") || userPerm.includes("division")) {
                $("#StaffMemberBtn").show();
                $("#AllAppBtn").show();
            }
            if (userPerm.includes("hr")) {
                $("#AllUserBtn").show();
            }
            if (userPerm.includes("division")) {
                $("#StaffDivisionBtn").show();
            }
            if (userPerm.includes("audit")) {
                $("#AuditLogBtn").show();
            }
        }
    }
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
        $("#recruitment a").attr("href", "/login");
        $("#ProfileTabBtn").attr("onclick", "window.location.href='/login'");
        $("#logout").hide();
        $("#header").prepend(`<a href='/login'>Login</a> <span style="color:orange">`);
        $("#DivisionBtn").hide();
        $("#DownloadsTabBtn").hide();
        return;
    }

    if (userid != -1 && userid != null) {
        // Logged in, and is member, show membersOnlyTabs
        $(".memberOnlyTabs").show();
    } else {
        // Logged in, not member, hide division and downloads
        $("#DivisionBtn").hide();
        $("#DownloadsTabBtn").hide();
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
                window.location.href = "/login";
                return;
            }

            // X Drivers Trucking Info
            color = "green";
            if (isdark) color = "lightgreen";
            $("#header").prepend(`<p style="color:${color}"><svg style="color:${color};display:inline" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
            fill="currentColor" class="bi bi-activity" viewBox="0 0 16 16">
            <path fill-rule="evenodd"
                d="M6 2a.5.5 0 0 1 .47.33L10 12.036l1.53-4.208A.5.5 0 0 1 12 7.5h3.5a.5.5 0 0 1 0 1h-3.15l-1.88 5.17a.5.5 0 0 1-.94 0L6 3.964 4.47 8.171A.5.5 0 0 1 4 8.5H.5a.5.5 0 0 1 0-1h3.15l1.88-5.17A.5.5 0 0 1 6 2Z"
                fill="${color}"></path>
            </svg>&nbsp;&nbsp;<span id="livedriver2" style="color:${color}"></span><span style="color:orange"></p>`);
            
            // User Information
            localStorage.setItem("roles", JSON.stringify(data.response.roles));
            localStorage.setItem("name", data.response.name);
            localStorage.setItem("avatar", data.response.avatar);
            localStorage.setItem("discordid", data.response.discordid);
            localStorage.setItem("userid", data.response.userid);

            // Check if is member
            userid = data.response.userid;
            if (data.response.userid != -1) {
                $("#AllMemberBtn").show();
            }
            roles = data.response.roles.sort(function (a, b) {
                return a - b
            });
            highestrole = roles[0];
            name = data.response.name;
            avatar = data.response.avatar;
            discordid = data.response.discordid;
            $("#name").html(name);
            if (avatar.startsWith("a_"))
                $("#avatar").attr("src", "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif");
            else
                $("#avatar").attr("src", "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png");
            
            UpdateRolesOnDisplay();
        }, error: function(data){
            // Invalid token, log out
            if(parseInt(data.status) == 401){ // Prevent connection issue (e.g. refresh)
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
        }
    });
}

function PathDetect() {
    p = window.location.pathname;
    if (p == "/overview") window.history.pushState("", "", '/');
    else if (p == "/") ShowTab("#HomeTab", "#HomeTabBtn");
    else if (p == "/announcement") ShowTab("#AnnTab", "#AnnTabBtn");
    else if (p == "/staff/announcement") ShowTab("#StaffAnnTab", "#StaffAnnTabBtn");
    else if (p == "/downloads") ShowTab("#DownloadsTab", "#DownloadsTabBtn");
    else if (p == "/map") ShowTab("#Map", "#MapBtn");
    else if (p.startsWith("/delivery")) {
        if(getUrlParameter("logid")){
            logid = getUrlParameter("logid");
            $(".tabbtns").removeClass("bg-indigo-500");
            $("#DeliveryBtn").addClass("bg-indigo-500");
            deliveryDetail(logid);
            return;
        }
        if (p.split("/").length >= 3) {
            $(".tabbtns").removeClass("bg-indigo-500");
            $("#DeliveryBtn").addClass("bg-indigo-500");
            deliveryDetail(p.split("/")[2]);
        } else ShowTab("#Delivery", "#DeliveryBtn");
    } else if (p == "/division") ShowTab("#Division", "#DivisionBtn");
    else if (p == "/staff/division") ShowTab("#StaffDivision", "#StaffDivisionBtn");
    else if (p == "/event") ShowTab("#Event", "#EventBtn");
    else if (p == "/staff/event") ShowTab("#StaffEvent", "#StaffEventBtn");
    else if (p.startsWith("/member")) {
        if(getUrlParameter("userid")){
            userid = getUrlParameter("userid");
            LoadUserProfile(userid);
            return;
        }
        if (p.split("/").length >= 3) LoadUserProfile(parseInt(p.split("/")[2]));
        else ShowTab("#AllMembers", "#AllMemberBtn");
    } else if (p == "/staff/member") {
        ShowTab("#StaffMembers", "#StaffMemberBtn");
    } else if (p == "/leaderboard") ShowTab("#Leaderboard", "#LeaderboardBtn");
    else if (p == "/ranking") ShowTab("#Ranking", "#RankingBtn");
    else if (p == "/application/my") ShowTab("#MyApp", "#MyAppBtn");
    else if (p == "/application/all") ShowTab("#AllApp", "#AllAppBtn");
    else if (p == "/application/submit" || p == "/apply") ShowTab("#SubmitApp", "#SubmitAppBtn");
    else if (p == "/staff/user") ShowTab("#AllUsers", "#AllUserBtn");
    else if (p == "/audit") ShowTab("#AuditLog", "#AuditLogBtn");
    else if (p == "/admin") ShowTab("#Admin", "#AdminBtn");
    else if (p.startsWith("/images")) {
        filename = p.split("/")[2];
        window.location.href = "https://drivershub-cdn.charlws.com/assets/" + vtcprefix + "/" + filename;
    } else{
        ShowTab("#HomeTab", "#HomeTabBtn");
        window.history.pushState("", "", '/');
    }
}

window.onpopstate = function (event) {
    PathDetect();
};

$(document).ready(async function () {
    $(".pageinput").val("1");
    LoadAnnouncement();
    PathDetect();
    InitDarkMode();
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
        positions = localStorage.getItem("positions");
        applicationTypes = localStorage.getItem("applicationTypes");
        if(rolelist != undefined && perms.admin != undefined && positions != undefined && applicationTypes != undefined) break;
        await sleep(100);
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
