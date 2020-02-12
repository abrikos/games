export default {

    _combinationSum: function(combination) {
        return combination.map(c => 2 ** c.idx).reduce((a, b) => a + b)
    },


    calc: function(hand, table) {
        const sorted = hand.concat(table).sort((a, b) => b.idx - a.idx);
        const flush = this._getFlush(sorted);
        if (flush && flush.straight) return flush;
        const care = this._getByValues(4, sorted);
        if (care) return care;
        if (flush) return flush;
        const straight = this._getStraight(sorted);
        if (straight) return straight;
        const set = this._getByValues(3, sorted);
        if (set) return set;
        const double = this._getDouble(sorted);
        if (double) return double;
        const pair = this._getByValues(2, sorted);
        if (pair) return pair;
        return this._getHighCard(sorted);
    },

    _getHighCard: function(source)  {
        const combination = source.splice(0, 5);
        return {combination, sum: this._combinationSum(combination), name: "High card", priority: 1}
    },

    _getDouble: function(sorted) {
        const combination = [];
        for (const s of sorted) {
            if (combination.length === 4) break;
            if (sorted.filter(s2 => s2.idx === s.idx).length === 2) combination.push(s)
        }
        const kickers = sorted.filter(s => !combination.map(c => c.idx).includes(s.idx))
        if (combination.length !== 4) return;
        combination.push(kickers[0])
        return combination && {combination, sum: this._combinationSum(combination), name: "Two pairs", priority: 2.5}
    },


    _getByValues: function(count, source)  {
        const names = {4: "Care", 3: "Set", 2: "Pair"};
        const sorted = Object.assign([], source);
        let obj = {};
        for (const s of sorted) {
            if (!obj[s.value]) obj[s.value] = [];
            obj[s.value].push(s);
        }
        const matched = Object.keys(obj).find(key => obj[key].length === count);
        let combination = obj[matched];
        const kickersCount = -7 - count;
        const kickers = sorted.filter(c => c.value !== matched)
            .splice(kickersCount - 2, 5 - count);
        if (!combination) return;
        combination = combination.concat(kickers);
        return {combination, sum: this._combinationSum(combination), name: names[count], priority: count}
    },


    _getFlush: function(sorted)  {
        const suites = {};
        let flush;
        for (const s of sorted) {
            if (!suites[s.suit]) suites[s.suit] = [];
            suites[s.suit].push(s);
            //logger.info(s)

            if (suites[s.suit].length === 5) {
                flush = suites[s.suit];
            }
        }
        //logger.info(flush.splice(0,5))
        if (!flush) return;
        const straight = this._getStraight(flush);
        let name;
        let priority;
        let combination;
        if (straight) {
            combination = straight.combination;
            name = flush[0].idx === 12 ? 'Flush Royal' : 'Straight flush';
            priority = 7
        } else {
            name = 'Flush';
            priority = 6;
            combination = flush.splice(0, 5)
        }
        //logger.info(combination)
        return {combination, max: combination[0], sum: this._combinationSum(combination), straight: !!straight, name, priority}
    },


    _getStraight: function(source)  {
        function check(card) {
            try {
                return sorted.find(c => c.idx === card.idx - 1)
                    && sorted.find(c => c.idx === card.idx - 2)
                    && sorted.find(c => c.idx === card.idx - 3)
                    && sorted.find(c => c.idx === card.idx - 4)
            } catch (e) {
                return false;
            }
        }

        const sorted = Object.assign([], source);
        if (sorted[0].idx === 12) {
            const ace = Object.assign({}, sorted[0]);
            ace.idx = -1;
            sorted.push(ace)
        }
        let combination = [];
        for (const card of sorted) {
            if (check(card)) {
                combination.push(card);
                for (let i = 1; i < 5; i++) {
                    combination.push(sorted.find(c => c.idx === card.idx - i))
                }
                return {combination, max: combination[0], name: 'Straight', priority: 5}
            }
        }


    }

}
