/**
 * # Auth settings
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = {

    /**
     * ## enabled
     *
     * If TRUE, authorization files will be imported and checked
     */
    enabled: true, // [true, false] Default: TRUE.

    /**
     * ## mode
     *
     * The mode for importing the authorization codes
     *
     * Available modes:
     *
     *   - 'dummy': creates dummy ids and passwords in sequential order.
     *   - 'auto': creates random 8-digit alphanumeric ids and passwords.
     *   - 'local': reads the authorization codes from a file. Defaults:
     *              codes.json, code.csv. A custom file can be specified
     *              in settings.file (available formats: json and csv).
     *   - 'remote': fetches the authorization codes from a remote URI.
     *               Available protocol: DeSciL protocol.
     *   - 'custom': The 'customCb' property of the settings object
     *               will be executed with settings and done callback
     *               as parameters.
     *
     */
    mode: 'dummy',

    /**
     * ## nCodes
     *
     * The number of codes to create
     *
     * Modes: 'dummy', 'auto'
     * Default: 100
     */
    nCodes: 1000,

    /**
     * ## addPwd
     *
     * If TRUE, a password field is added to each code
     *
     * Modes: 'dummy', 'auto'
     * Default: FALSE
     */
    // addPwd: true,

    /**
     * ## codesLength
     *
     * The length of generated codes
     *
     * Modes: 'auto'
     * Default: { id: 8, pwd: 8, AccessCode: 6, ExitCode: 6 }
     */
    // codesLength: { id: 8, pwd: 8, AccessCode: 6, ExitCode: 6 },

    /**
     * ## customCb
     *
     * The custom callback associated to mode 'custom'
     *
     * Modes: 'custom'
     */
    // customCb: function(settings, done) { return [ ... ] },

    /**
     * ## inFile
     *
     * The name of the codes file inside auth/ dir or a full path to it
     *
     * Available formast: .csv and .json.
     *
     * Modes: 'local'
     * Default: 'codes.json', 'code.csv' (tried in sequence)
     */
    // inFile: 'codes.csv',

    /**
     * ## dumpCodes
     *
     * If TRUE, all imported codes will be dumped to file `outFile`
     *
     * Modes: 'dummy', 'auto', 'local', 'remote', 'custom'
     * Default: TRUE
     */
    // dumpCodes: false

    /**
     * ## outFile
     *
     * The name of the codes dump file inside auth/ dir or a full path to it
     *
     * Only used, if `dumpCodes` is TRUE. Available formast: .csv and .json.
     *
     * Modes: 'dummy', 'auto', 'local', 'remote', 'custom'
     * Default: 'codes.imported.csv'
     */
    // outFile: 'my.imported.codes.csv',

    /**
     * ## importer
     *
     * Importer function processing the different import modes
     *
     * Must export a function that returns an array of codes synchronously
     * or asynchronously.
     *
     * Modes: 'dummy', 'auto', 'local', 'remote', 'custom'
     */
    // codes: 'auth.codes.js',

    // # Reserved words for future requirements settings.

    // page: 'login.htm'

    /**
     * ## claimId
     *
     * If TRUE, remote clients will be able to claim an id via GET request
     */
    claimId: true,

    /**
     * ## claimIdValidateRequest
     *
     * Returns TRUE if a requester is authorized to claim an id
     *
     * Returns an error string describing the error otherwise.
     */
    claimIdValidateRequest: function(query, headers) {
        if ('string' !== typeof query.a || query.a === '') {

            return 'missing or invalid AssignmentId';
        }
        if ('string' !== typeof query.h || query.h === '') {
            return 'missing or invalid HITId';
        }
        // WorkerId is id, already checked.
        return true;
    },

    /**
     * ## claimIdPostProcess
     *
     * Manipulates the client object
     */
    claimIdPostProcess: function(code, query, headers) {
        code.WorkerId = query.id;
        code.AssignmentId = query.a;
        code.HITId = query.h;
    }
};
