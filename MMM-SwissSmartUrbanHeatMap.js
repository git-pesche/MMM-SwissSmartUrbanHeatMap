// Copyright 2024 Peter Egli
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

Module.register('MMM-SwissSmartUrbanHeatMap', {
  defaults: {
    // The location for which to retrieve the river temperature. Valid options
    // you will find by the Smart Urban Heat Map
    // API: https://smart-urban-heat-map.ch/api/1.0/stations.
    city: '1E40CBFEFFE70FFE',  // Elfenau, nice place in Bern!

    // How to display the humidity. Valid options are 'vertical', 'horizontal'
    // or 'none'.
    humidity: 'horizontal',

    // Update interval in millseconds.
    // Defaults to every 10min.
    updateIntervalMs: 5 * 60 * 1000,

    // API location. For API-doc see: https://meteotest.github.io/urban-heat-API-docs/de/
    api: 'https://smart-urban-heat-map.ch/api/1.0/timeseries?',
  },

  requiresVersion: '2.2.1',

  start: function () {
    if (!['horizontal', 'vertical', 'none'].includes(this.config.humidity)) {
      Log.error(
        'Expected humidity position setting to be one of "horizontal", "vertical" or ' +
        `"none" but got "${this.config.humidity}"`);
    }
    Log.info(`Starting module: ${this.name}`);// Load initial data.
    this.response = {};
    this.getData();
  },

  getTemplate: function () {
    return 'MMM-SwissSmartUrbanHeatMap.njk';
  },

  getTemplateData: function () {
    if (this.response['stationId'] === undefined) {
      return { loading: true };
    }
    const myStationID = this.response['stationId'];
    const values = this.response['values'][0];
	const lastReadTimeStamp = moment(values.dateObserved).format('DD MMM YYYY HH:mm');
	values['lastReadTimeStamp'] = lastReadTimeStamp;
    values['loading'] = false;
    values['humidity'] = this.config.humidity;
    return values;
  },

  // Get required scripts.
  getScripts () {
        return ["moment.js" , "font-awesome.css"];
   },


  // Get styles from css
  getStyles: function () {
    return ['MMM-SwissSmartUrbanHeatMap.css'];
  },


  getData: function () {
    const request = new XMLHttpRequest();
    request.open('GET', `${this.config.api}stationId=${this.config.city}&timeFrom=-15minutes`, true);
    request.onreadystatechange = () => {
      if (request.readyState != 4) {
        return;
      };

      if (request.status === 200) {
        this.response = JSON.parse(request.response);
        this.updateDom();
      } else {
        Log.error(`${this.name}: Could not load data`);
      }
      setTimeout(() => this.getData(), this.config.updateIntervalMs);
    };
    request.send();
  },
});
