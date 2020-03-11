const path = require('path');

const sfcta_components = [
     'cmp',
     'walkskims',
     'hwyskims',
     'tnc',
	   'autolos',
     'tmcshp',
     'viz-template',
     'sftraveldemand',
     'champlu',
     'tnctrn',
     'tnctrntaz',
     'hwynet',
     'csf_tt',
     'csf_jobpop',
     'csf_acc',
     'csf_pattern',
     'csf_trnload',
     'csf_vmt',
     'coc',
     'cmptest',
     'cmpqa',
     'cmp_safety',
     'champtrips',
     'tnctrnfac',
     'survey2018',
     'survey2018_local',
	 //'cmp-v0',
];

module.exports = {
     entry: () => {
        let entries = {};
        for (let tool of sfcta_components) {
          entries[tool] = ['babel-polyfill', `./src/${tool}/code.js`];
        }
        return entries;
     },

     output: {
         path: path.join(__dirname, './src/bundles/'),
         filename: '[name].js'
     },

     module: {
       loaders: [{
         loader: 'babel-loader',
         exclude: /node_modules/,
         query: {
           plugins: ['transform-runtime'],
           presets: [
             ['env', {
               "targets": {
                 "browsers": [
                    "Explorer 11",
                    "Safari >= 8",
                    "last 3 Chrome versions",
                    "last 3 Firefox versions",
                    "last 3 Edge versions"
                  ]
               },
               "useBuiltIns": true
             }]
           ]
         }
       }]
     },
};
