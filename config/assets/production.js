'use strict';

/* eslint comma-dangle:[0, "only-multiline"] */

module.exports = {
  client: {
    lib: {
      css: [
        // bower:css
         'public/lib/angular-ui-notification/dist/angular-ui-notification.min.css',
         'public/lib/bootstrap/dist/css/bootstrap.min.css',
         'public/lib/font-awesome/css/all.min.css',
         'public/lib/ng-table-bundle/ng-table.min.css',
        // endbower
      ],
      js: [
        // bower:js
         'public/lib/jquery/dist/jquery.min.js',
         'public/lib/angular/angular.min.js',
         'public/lib/angular-animate/angular-animate.min.js',
         'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
         'public/lib/angular-messages/angular-messages.min.js',
         'public/lib/angular-mocks/angular-mocks.js',
         'public/lib/angular-resource/angular-resource.min.js',
         'public/lib/angular-cookies/angular-cookies.min.js',
         'public/lib/angular-sanitize/angular-sanitize.min.js',
         'public/lib/angular-ui-notification/dist/angular-ui-notification.min.js',
         'public/lib/angular-ui-router/release/angular-ui-router.min.js',
         'public/lib/bootstrap/dist/js/bootstrap.min.js',
         'public/lib/ng-file-upload/ng-file-upload.min.js',
         'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
         'public/lib/font-awesome/js/all.min.js',
         'public/lib/ng-table-bundle/ng-table.min.js',
         'public/lib/angular-translate/angular-translate.min.js',
         'public/lib/angular-translate-storage-cookie/angular-translate-storage-cookie.min.js',
         'public/lib/angular-translate-storage-local/angular-translate-storage-local.min.js',
         'public/lib/angular-translate-loader-url/angular-translate-loader-url.min.js',
         'public/lib/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
         'public/lib/select2/dist/js/select2.min.js',
        // endbower
      ]
    },
    css: 'public/dist/application*.min.css',
    js: 'public/dist/application*.min.js'
  }
};
