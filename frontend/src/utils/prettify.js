const wordMap = {
    rrsp: 'RRSP',
    kyc: 'KYC',
    cra: 'CRA',
    srrsp: 'Spousal RRSP',
    rrif: 'RRIF',
    srrif: 'Spousal RRIF',
    lirrsp: 'Locked-in RRSP',
    rsp: 'RSP',
    eap: 'EAP',
    pep: 'PEP',
    pefp: 'PEFP',
    fpep: 'FPEP',
    dpep: 'DPEP',
    pedp: 'PEDP',
    hio: 'HIO',
    llc: 'LLC',
    lta: 'LTA',
    dtc: 'DTC',
    dap: 'DAP',
    us: 'US',
    ab: 'AB',
    bc: 'BC',
    bctesg: 'BCTESG',
    nbin: 'NBIN',
    bin: 'BIN',
    clb: 'CLB',
    tcp: 'TCP',
    id: 'ID',
    pac: 'PAC',
    swp: 'SWP',
    eft: 'EFT',
    rif: 'RIF',
    lira: 'LIRA',
    lif: 'LIF',
    rlif: 'RLIF',
    prif: 'PRIF',
    lrif: 'LRIF',
    rlsp: 'RLSP',
    lrsp: 'LRSP',
    resp: 'RESP',
    rdsp: 'RDSP',
    giin: 'GIIN',
    itf: 'ITF',
    sin: 'SIN',
    tin: 'TIN',
    ssn: 'SSN',
    ipp: 'IPP',
    rpp: 'RPP',
    ta: 'TA',
    ips: 'IPS',
    tfsa: 'TFSA',
    one: '#1',
    two: '#2',
    three: '#3',
    four: '#4',
    five: '#5',
    six: '#6',
    seven: '#7',
    eight: '#8',
    nine: '#9',
    w8ben: 'W-8BEN',
    w8bene: 'W-8BEN-E',
    w8eci: 'W-8ECI',
    w8exp: 'W-8EXP',
    w8imy: 'W-8IMY',
    rc518: 'RC518',
    rc519: 'RC519',
    rc520: 'RC520',
    rc521: 'RC521',
    nr301: 'NR301',
    nr302: 'NR302',
    nr303: 'NR303',
    poa: 'POA',
    or: 'or',
    of: 'of',
    at: 'at',
    and: 'and',
    for: 'for',
    with: 'with',
    without: 'without',
    in: 'in',
    on: 'on',
    linkedin: 'LinkedIn'
};

/**
 * @function prettify
 * @param {String} string - the string to prettify
 * @returns {String} the prettified version of the string
 */
export default function prettify(string) {
    if (typeof string !== 'string') {
        throw Error(`Expected string but got ${typeof string} at the beautifier function for ${JSON.stringify(string)}`);
    }

    let split_clone = [];

    for (let subsection of string.split(/[-_]/)) {
        if (subsection.includes('.')) {
            subsection = subsection.split('.').map(part => prettify(part)).join(' - ');
        }
        split_clone.push(subsection);
    }

    const result = [];

    for (const word of split_clone) {
        if (Object.keys(wordMap).includes(word.toLowerCase())) {
            result.push(wordMap[word.toLowerCase()]);
        } else if (Number(word) == word && word) {
            result.push(`#${word}`);
        } else {
            result.push(`${word.charAt(0).toUpperCase()}${word.slice(1)}`);
        }
    }
    return result.join(' ');
}