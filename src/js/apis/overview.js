
sc = undefined;
chartscale = 2;
addup = 0;

async function loadChart(userid = -1) {
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
        url: apidomain + "/" + vtcprefix + "/dlog/chart?scale=" + chartscale + "&addup=" + addup + "&quserid=" + userid,
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
                ts = d[i].starttime;
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
                distance.push(parseInt(d[i].distance * distance_ratio));
                fuel.push(d[i].fuel);
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

function loadStats(basic = false) {
    if (curtab != "#HomeTab" && curtab != "#Delivery") return;
    loadChart();
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog/stats",
        type: "GET",
        dataType: "json",
        success: function (data) {
            d = data.response;
            drivers = TSeparator(d.drivers.all);
            newdrivers = TSeparator(d.drivers.new);
            jobs = TSeparator(d.jobs.all);
            newjobs = TSeparator(d.jobs.new);
            if (distance_unit == "metric") {
                distance = sigfig(d.distance.all) + "km";
                newdistance = sigfig(d.distance.new) + "km";
            } else if (distance_unit == "imperial") {
                distance = sigfig(parseInt(d.distance.all * distance_ratio)) + "mi";
                newdistance = sigfig(parseInt(d.distance.new * distance_ratio)) + "mi";
            }
            europrofit = "€" + sigfig(d.profit.all.euro);
            neweuroprofit = "€" + sigfig(d.profit.new.euro);
            dollarprofit = "$" + sigfig(d.profit.all.dollar);
            newdollarprofit = "$" + sigfig(d.profit.new.dollar);
            fuel = sigfig(d.fuel.all) + "L";
            newfuel = sigfig(d.fuel.new) + "L";
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

            driver_of_the_day = d.driver_of_the_day;
            discordid = driver_of_the_day.discordid;
            avatar = driver_of_the_day.avatar;
            if (avatar != null) {
                if (avatar.startsWith("a_"))
                    src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif";
                else
                    src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png";
            } else {
                avatar = "https://drivershub-cdn.charlws.com/assets/"+vtcprefix+"/logo.png";
            }
            distance = TSeparator(parseInt(driver_of_the_day.distance * distance_ratio));
            $("#dotd").html(`<img src="${src}" style="width:20px;border-radius:100%;display:inline" onerror="$(this).attr('src','https://drivershub-cdn.charlws.com/assets/`+vtcprefix+`/logo.png');"> <b>${driver_of_the_day.name}</b>`);
            $("#dotddistance").html(`Driven ${distance}${distance_unit_txt}`);

            $("#dalljob").html(newjobs);
            $("#dtotdistance").html(newdistance);

            const ctx = document.getElementById('deliveryStatsChart').getContext('2d');
            const config = {
                type: 'pie',
                data: {
                    labels: ['Euro Truck Simulator 2', 'American Truck Simulator'],
                    datasets: [{
                        label: 'Game Preference',
                        data: [d.jobs.ets2, d.jobs.ats],
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
    if (token.length != 36 || !isNumber(localStorage.getItem("userid")) || localStorage.getItem("userid") == -1) return; // guest / invalid
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
                    totalpnt = TSeparator(parseInt(user.totalpnt));
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
                <a style="cursor: pointer" onclick="loadProfile(${userid})"><img src='${src}' width="20px" style="display:inline;border-radius:100%" onerror="$(this).attr('src','https://drivershub-cdn.charlws.com/assets/`+vtcprefix+`/logo.png');"> ${name}</a></td>
              <td class="py-5 px-6">${totalpnt}</td>
            </tr>`);
                }
            }
        });
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/dlog/newdrivers",
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
                    dt = new Date(user.joints * 1000);
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
                <a style="cursor: pointer" onclick="loadProfile(${userid})"><img src='${src}' width="20px" style="display:inline;border-radius:100%" onerror="$(this).attr('src','https://drivershub-cdn.charlws.com/assets/`+vtcprefix+`/logo.png');"> ${name}</a></td>
              <td class="py-5 px-6">${joindt}</td>
            </tr>`);
                }
            }
        });
    }
}