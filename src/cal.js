 'use strict';

const __getWeekMap = (fromMonday) => {
    return fromMonday ? {
        GAP:     1,
        DAY_STR: ['月', '火', '水', '木', '金', '土', '日']
    } : {
        GAP:     0,
        DAY_STR: ['日', '月', '火', '水', '木', '金', '土']
    };
};

const __pad2 = (num) => {
    return ('0' + num).slice(-2);
};

export default class Cal {
    constructor(options) {
      options = options || {};

      this.year  = (options.year|0)  || 2017;
      this.month = (options.month|0) || 1;
      this.date  = (options.date|0)  || 1;

      this._weekMap = __getWeekMap(!!options.fromMonday);
      this._calArr  = this._generateCalArr();
      this._dayArr  = this._generateDayArr();
    }

    getCalArr() {
        return this._calArr.slice();
    }

    getDayArr() {
        return this._dayArr.slice();
    }

    _generateCalArr() {
        const { DAY_STR, GAP } = this._weekMap;

        // monthのoriginは0から
        const thisFirstDateObj = new Date(this.year, this.month - 1, 1);
        // 次月の0day目は、今月の末日
        const thisLastDateObj  = new Date(this.year, this.month, 0);

        const thisYear     = this.year;
        const thisMonth    = this.month;
        const thisFirstDay = DAY_STR[thisFirstDateObj.getDay()];
        const thisLastDate = thisLastDateObj.getDate();

        const thisFirstDayIdx = (() => {
            const index = DAY_STR.indexOf(thisFirstDay);
            // その月の1日が日曜日かつ設定が月曜始まりの場合、
            // 前月の最終月曜から出力しなければならないため、5を返す
            return (index === 0 && GAP === 1) ? 5 : index - 1 - GAP;
        })();

        // 今月が1月なら、先月は12月で去年になる
        const mayLastYear = (thisMonth === 1) ? thisYear - 1 : thisYear;
        const lastMonth   = (thisMonth === 1) ? 12 : thisMonth - 1;

        // 先月の末日は今月の0日目
        const lastLastDateObj = new Date(mayLastYear, lastMonth, 0);
        const lastLastDate    = lastLastDateObj.getDate();

        // 今月が12月なら、来月は1月で来年になる
        const mayNextYear = (thisMonth === 12) ? thisYear + 1 : thisYear;
        const nextMonth   = (thisMonth === 12) ? 1 : thisMonth + 1;

        const calArr = [];
        let dayObj;
        let i = 0, l = 7 * 6; // 7days * 6weeks
        for (; i < l; i++) {
            const date = i - thisFirstDayIdx;
            // 先月
            if (date < 1) {
                calArr[i] = this._getDayObj({
                    y: mayLastYear,
                    m: lastMonth,
                    d: lastLastDate + date,
                    i: i,
                    isNextMonth: false,
                    isLastMonth: true
                });
            }
            // 来月
            else if (thisLastDate < date) {
                calArr[i] = this._getDayObj({
                    y: mayNextYear,
                    m: nextMonth,
                    d: date - thisLastDate,
                    i: i,
                    isNextMonth: true,
                    isLastMonth: false
                });
            }
            // 今月
            else {
                calArr[i] = this._getDayObj({
                    y: thisYear,
                    m: thisMonth,
                    d: date,
                    i: i,
                    isNextMonth: false,
                    isLastMonth: false
                });
            }
        }

        return calArr;
    }

    _generateDayArr() {
        const { DAY_STR, GAP } = this._weekMap;

        const dayArr = [];
        let i = 0, l = DAY_STR.length;
        for (; i < l; i++) {
            dayArr[i] = {
                str: DAY_STR[i],
                no : (i + GAP) % 7
            };
        }

        return dayArr;
    }

    _getDayObj(args) {
        const { DAY_STR, GAP } = this._weekMap;
        const year    = args.y,
              month   = args.m,
              date    = args.d,
              i       = args.i;

        const MM          = __pad2(month);
        const DD          = __pad2(date);
        const DAY         = DAY_STR[i % 7];
        const day         = (i + GAP) % 7;
        const isSun       = day === 0;
        const isSat       = day === 6;
        const isNextMonth = args.isNextMonth;
        const isLastMonth = args.isLastMonth;
        const isBaseDate  = !isLastMonth && !isNextMonth && date === this.date;

        return {
            YYYYMMDD   : year + MM + DD,
            YYYY       : year,
            MM         : MM,
            DD         : DD,
            DAY        : DAY,
            year       : year,
            month      : Math.max(0, month - 1),
            date       : date,
            day        : day,
            isBaseDate : isBaseDate,
            isSunday   : isSun,
            isSaturday : isSat,
            isNextMonth: isNextMonth,
            isLastMonth: isLastMonth
        };
    }
}

module.exports = Cal;
