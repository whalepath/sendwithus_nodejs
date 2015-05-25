var restler     = require('restler');
var packageData = require('../package.json');
var events = require('events');
var util = require('util');

var API_PROTOCOL       = 'https';
var API_HOST           = 'api.sendwithus.com';
var API_VERSION        = '1_0';
var API_HEADER_KEY     = 'X-SWU-API-KEY';
var API_HEADER_CLIENT  = 'X-SWU-API-CLIENT';
var API_CLIENT         = 'node-' + packageData.version;

var Sendwithus = function Sendwithus(config, debug) {
    events.EventEmitter.call(this); // call the prototype ctor
    this.API_PROTOCOL = API_PROTOCOL;
    this.API_HOST = API_HOST;
    this.API_VERSION = API_VERSION;
    this.API_CLIENT = API_CLIENT;
    if ( typeof config === 'string' ) {
        this.API_KEY = config;
    } else {
        this.API_KEY = config.apiKey;
        if ( config.apiBaseUrl ) {
            this.apiBaseUrl = config.apiBaseUrl;
        } else {
            if ( config.apiProtocol ) {
                this.API_PROTOCOL = config.apiProtocol;
            }
            if ( config.apiHost ) {
                this.API_HOST = config.apiHost;
            }
        }
        if ( config.apiVersion ) {
            this.API_VERSION = config.apiVersion;
        }
        if ( config.apiClient ) {
            this.API_CLIENT = config.apiClient;
        }
    }
    if ( this.apiBaseUrl == null ) {
        this.apiBaseUrl = this.API_PROTOCOL + '://' + this.API_HOST;
    }
    this.DEBUG = debug || false;

    this._debug('Debug enabled');
};

// extend the EventEmitter
util.inherits(Sendwithus, events.EventEmitter);

Sendwithus.prototype._debug = function(str) {
    if (this.DEBUG) {
        console.log('SENDWITHUS: ' + str);
    }
};

Sendwithus.prototype._buildHeaders = function() {
    var headers = { };
    headers[API_HEADER_KEY] = this.API_KEY;
    headers[API_HEADER_CLIENT] = this.API_CLIENT;

    this._debug('Set headers: ' + JSON.stringify(headers));

    return headers;
};

Sendwithus.prototype._getOptions = function() {
    return {
        headers: this._buildHeaders()
    };
};

Sendwithus.prototype._buildUrl = function(resource, identifier, action) {
    var url = this.apiBaseUrl + '/api/' + 'v' + this.API_VERSION + '/';

    if (resource) { url += resource; }
    if (identifier) { url += '/' + identifier; }
    if (action) { url += '/' + action; }

    this._debug('Built url: ' + url);

    return url;
};

Sendwithus.prototype._handleResponse = function(result, response, callback) {
    if (result instanceof Error) {
        this._debug('Request Error: ' + result.stack);
        if (typeof callback == 'function') { callback(result); }
    } else if (response.statusCode === 200) {
        this.emit('response', response.statusCode, result,response);
        this._debug('Response 200: ' + JSON.stringify(result));
        if (typeof callback == 'function') { callback(null, result); }
    } else {
        this.emit('response', response.statusCode, result,response);
        this._debug('Response ' + response.statusCode + ': ' + JSON.stringify(result));

        var err = new Error('Request failed with ' + response.statusCode);
        err.statusCode = response.statusCode;

        if (typeof callback == 'function') { callback(err, result); }
    }
};


////////////////////////////
// PUBLIC METHODS

Sendwithus.prototype.send = function(data, callback) {
    var url = this._buildUrl('send');

    var options = this._getOptions();

    var that = this;
    this.emit('request', 'POST', url, options.headers, data);
    restler
        .postJson(url, data, options)
        .once('complete', function(result, response) {
            that._handleResponse.call(that, result, response, callback);
        });
};

Sendwithus.prototype.emails = function(callback) {
    var url = this._buildUrl('emails');

    var options = this._getOptions();

    var that = this;
    this.emit('request', 'GET', url, options.headers, { });
    restler
        .get(url, options)
        .once('complete', function(result, response) {
            that._handleResponse.call(that, result, response, callback);
        });
};

Sendwithus.prototype.customersUpdateOrCreate = function(data, callback) {
    var url = this._buildUrl('customers');

    var options = this._getOptions();

    var that = this;
    this.emit('request', 'POST', url, options.headers, data);
    restler
        .postJson(url, data, options)
        .once('complete', function(result, response) {
            that._handleResponse.call(that, result, response, callback);
        });
};

Sendwithus.prototype.customersDelete = function(email, callback) {
    var url = this._buildUrl('customers', email);

    var options = this._getOptions();

    var that = this;
    this.emit('request', 'DELETE', url, options.headers, { });
    restler
        .del(url, options)
        .once('complete', function(result, response) {
            that._handleResponse.call(that, result, response, callback);
        });
};

Sendwithus.prototype.segments = function(callback) {
    var url = this._buildUrl('segments');

    var options = this._getOptions();

    var that = this;
    this.emit('request', 'GET', url, options.headers, { });
    restler
        .get(url, options)
        .once('complete', function(result, response) {
            that._handleResponse.call(that, result, response, callback);
        });
};

Sendwithus.prototype.segmentsRun = function(segment_id, callback) {
    var url = this._buildUrl('segments', segment_id, 'run');

    var options = this._getOptions();

    var that = this;
    this.emit('request', 'GET', url, options.headers, { });
    restler
        .get(url, options)
        .once('complete', function(result, response) {
            that._handleResponse.call(that, result, response, callback);
        });
};

Sendwithus.prototype.segmentsSend = function(segment_id, data, callback) {
    var url = this._buildUrl('segments', segment_id, 'send');

    var options = this._getOptions();

    var that = this;
    this.emit('request', 'POST', url, options.headers, data);
    restler
        .postJson(url, data, options)
        .once('complete', function(result, response) {
            that._handleResponse.call(that, result, response, callback);
        });
};

Sendwithus.prototype.dripCampaignList = function(callback) {
    var url = this._buildUrl('drip_campaigns');

    var options = this._getOptions();

    var that = this;
    this.emit('request', 'GET', url, options.headers, { });
    restler
        .get(url, options)
        .once('complete', function(result, response) {
            that._handleResponse.call(that, result, response, callback);
        });
};

Sendwithus.prototype.dripCampaignDetails = function(drip_campaign_id, callback) {
    var url = this._buildUrl('drip_campaigns', drip_campaign_id);

    var options = this._getOptions();

    var that = this;
    this.emit('request', 'GET', url, options.headers, { });
    restler
        .get(url, options)
        .once('complete', function(result, response) {
            that._handleResponse.call(that, result, response, callback);
        });
};

Sendwithus.prototype.dripCampaignActivate = function(drip_campaign_id, data, callback) {
    var url = this._buildUrl('drip_campaigns', drip_campaign_id, 'activate');

    var options = this._getOptions();

    var that = this;
    this.emit('request', 'POST', url, options.headers, data);
    restler
        .postJson(url, data, options)
        .once('complete', function(result, response) {
            that._handleResponse.call(that, result, response, callback);
        });
};

Sendwithus.prototype.dripCampaignDeactivate = function(drip_campaign_id, data, callback) {
    var url = this._buildUrl('drip_campaigns', drip_campaign_id, 'deactivate');

    var options = this._getOptions();

    var that = this;
    this.emit('request', 'POST', url, options.headers, data);
    restler
        .postJson(url, data, options)
        .once('complete', function(result, response) {
            that._handleResponse.call(that, result, response, callback);
        });
};

Sendwithus.prototype.dripCampaignDeactivateAll = function(data, callback) {
    var url = this._buildUrl('drip_campaigns', 'deactivate');

    var options = this._getOptions();

    var that = this;
    this.emit('request', 'POST', url, options.headers, data);
    restler
        .postJson(url, data, options)
        .once('complete', function(result, response) {
            that._handleResponse.call(that, result, response, callback);
        });
};

Sendwithus.prototype.addCustomerEvent = function(customerAddress, data, callback) {
    var url = this._buildUrl('customers', customerAddress, 'conversions');

    var options = this._getOptions();

    var that = this;
    this.emit('request', 'POST', url, options.headers, data);
    restler
        .postJson(url, data, options)
        .once('complete', function(result, response) {
            that._handleResponse.call(that, result, response, callback);
        });
};

Sendwithus.prototype.conversionEvent = function(customerAddress, data, callback) {
    var url = this._buildUrl('customers', customerAddress, 'conversions');

    var options = this._getOptions();

    var that = this;
    this.emit('request', 'POST', url, options.headers, data);
    restler
        .postJson(url, data, options)
        .once('complete', function(result, response) {
            that._handleResponse.call(that, result, response, callback);
        });
};

Sendwithus.prototype.createTemplate = function(data, callback) {
    var url = this._buildUrl('templates');

    var options = this._getOptions();

    var that = this;
    this.emit('request', 'POST', url, options.headers, data);
    restler
        .postJson(url, data, options)
        .once('complete', function(result, response) {
              that._handleResponse.call(that, result, response, callback);
        });
};

Sendwithus.prototype.createTemplateVersion = function (templateId, data, callback) {
    var url = this._buildUrl('templates', templateId, 'versions');

    var options = this._getOptions();

    var that = this;
    this.emit('request', 'POST', url, options.headers, data);
    restler
        .postJson(url, data, options)
        .once('complete', function(result, response) {
            that._handleResponse.call(that, result, response, callback);
        });
};

module.exports = function(apiKey, debug) {
    return new Sendwithus(apiKey, debug);
};

