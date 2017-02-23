var Promise = require('bluebird');
var policydata = require('./policy.json');
var accountsdata = require('./accounts.json');

module.exports = {
    searchPolicy: function (policynumber) {
        return new Promise(function (resolve) {

            var _policy;
            for (var i = 0, l = policydata.policies.length; i < l; i++){
                var obj = policydata.policies[i];
                console.log(obj.policynumber);
                if (obj.policynumber === policynumber) {
                    _policy = obj;
                    break;
                }
            }


            // complete promise with a timer to simulate async response
            setTimeout(() => resolve(_policy), 1000);
        });
    },
    searchAccounts: function (accountnumber) {
        return new Promise(function (resolve) {

            var _account;
            for (var i = 0, l = accountsdata.accounts.length; i < l; i++){
                var obj = accountsdata.accounts[i];
                if (obj.accountid === accountnumber) {
                    _account = obj;
                    break;
                }
            }


            // complete promise with a timer to simulate async response
            setTimeout(() => resolve(_account), 1000);
        });
    }
};