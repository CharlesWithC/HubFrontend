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