export default {
    valid: [
        {
            description: 'Decred mainnet regular transaction',
            network: 'decred',
            hex: '01000000035fb1b570a1fd2795f4a7aea3f0b3874c4b33c1d4b7cb4c2e29456806536594ce0200000000ffffffff6757dd66c980bff512080dfb5ea5d21c3eebdf5a69569ea3a7eb3dffd2498e4d0300000001fffffffffb44485a5cdb09508d616e262ba8b05aa600ec244f95ba3a6c543f6cdeafae090200000000ffffffff0366ea1a000000000000001976a9141efd385c4b4fa8a0205fc9a47ef8abe160b7172388ac259b1b530300000000001976a9141efd385c4b4fa8a0205fc9a47ef8abe160b7172388ac5bd642a20200000000001976a9148ce1b6887003bdd2e3b3bc4354a49c0230dd02db88ac0000000000000000037df5700500000000c5dd0600010000006a47304402207dcdf4964867cfc3e4a7dd428c646fd21b041b9dfb076f386c46369448f834a702206541ee4b22fb48f9f5a0223c5b5c062a5b63ce026d701163344985a62017f5d201210246db4bad27e1c5284c45da941e62384bcf0c73cb6a70f0586659627432891813b5efef3003000000b8e20600000000006a47304402202a69781fac35d03bc93ef3927fc88eda0cc7ace9d1238f639a0fb9fa6621837702203dc3d16a0c7d9b2adf456f6889c1297d43d2c19a7d681713242eb251e68176560121025467d8fe51fa72c852d804fad1907072c8982bd1ee6d2cfda542226f4d87e643f68e18bf02000000b1c506000b0000006b483045022100c71502cef59fa1bdd4bd74ce63ac9b6d37861c934f5294e6478191ce379b292a0220045c497050e96a04d999757c705f708831b27c5d23dca462e2c12468f9dc1d430121027bbffa872daa09470dcde36fc542bb3fc408c1ee11338204f902ad958f723cb8',
            id: '310bd630b08b022c09f7ef75494b84b6a3be3ff7d3a61878f35616ceea3559ba',
            hash: 'ba5935eace1656f37818a6d3f73fbea3b6844b4975eff7092c028bb030d60b31',
            coinbase: false,
            virtualSize: 154,
            weight: 616,
            raw: {
                version: 1,
                type: 0,
                locktime: 0,
                expiry: 0,
                ins: [
                    {
                        hash: '5fb1b570a1fd2795f4a7aea3f0b3874c4b33c1d4b7cb4c2e29456806536594ce',
                        index: 2,
                        tree: 0,
                        script: '47304402207dcdf4964867cfc3e4a7dd428c646fd21b041b9dfb076f386c46369448f834a702206541ee4b22fb48f9f5a0223c5b5c062a5b63ce026d701163344985a62017f5d201210246db4bad27e1c5284c45da941e62384bcf0c73cb6a70f0586659627432891813',
                        sequence: 4294967295,
                        value: '91288957',
                        height: 449989,
                        blockIndex: 1,
                    },
                    {
                        hash: '6757dd66c980bff512080dfb5ea5d21c3eebdf5a69569ea3a7eb3dffd2498e4d',
                        index: 3,
                        tree: 1,
                        script: '47304402202a69781fac35d03bc93ef3927fc88eda0cc7ace9d1238f639a0fb9fa6621837702203dc3d16a0c7d9b2adf456f6889c1297d43d2c19a7d681713242eb251e68176560121025467d8fe51fa72c852d804fad1907072c8982bd1ee6d2cfda542226f4d87e643',
                        sequence: 4294967295,
                        value: '13705932725',
                        height: 451256,
                        blockIndex: 0,
                    },
                    {
                        hash: 'fb44485a5cdb09508d616e262ba8b05aa600ec244f95ba3a6c543f6cdeafae09',
                        index: 2,
                        tree: 0,
                        script: '483045022100c71502cef59fa1bdd4bd74ce63ac9b6d37861c934f5294e6478191ce379b292a0220045c497050e96a04d999757c705f708831b27c5d23dca462e2c12468f9dc1d430121027bbffa872daa09470dcde36fc542bb3fc408c1ee11338204f902ad958f723cb8',
                        sequence: 4294967295,
                        value: '11795992310',
                        height: 443825,
                        blockIndex: 11,
                    },
                ],
                outs: [
                    {
                        value: '1763942',
                        script: '76a9141efd385c4b4fa8a0205fc9a47ef8abe160b7172388ac',
                        version: 0,
                    },
                    {
                        value: '14279220005',
                        script: '76a9141efd385c4b4fa8a0205fc9a47ef8abe160b7172388ac',
                        version: 0,
                    },
                    {
                        value: '11312223835',
                        script: '76a9148ce1b6887003bdd2e3b3bc4354a49c0230dd02db88ac',
                        version: 0,
                    },
                ],
            },
        },
        {
            description: 'Decred mainnet regular transaction no witness',
            network: 'decred',
            hex: '01000100035fb1b570a1fd2795f4a7aea3f0b3874c4b33c1d4b7cb4c2e29456806536594ce0200000000ffffffff6757dd66c980bff512080dfb5ea5d21c3eebdf5a69569ea3a7eb3dffd2498e4d0300000001fffffffffb44485a5cdb09508d616e262ba8b05aa600ec244f95ba3a6c543f6cdeafae090200000000ffffffff0366ea1a000000000000001976a9141efd385c4b4fa8a0205fc9a47ef8abe160b7172388ac259b1b530300000000001976a9141efd385c4b4fa8a0205fc9a47ef8abe160b7172388ac5bd642a20200000000001976a9148ce1b6887003bdd2e3b3bc4354a49c0230dd02db88ac0000000000000000',
            id: '310bd630b08b022c09f7ef75494b84b6a3be3ff7d3a61878f35616ceea3559ba',
            hash: 'ba5935eace1656f37818a6d3f73fbea3b6844b4975eff7092c028bb030d60b31',
            coinbase: false,
            virtualSize: 62,
            weight: 245,
            raw: {
                type: 1,
                version: 1,
                locktime: 0,
                expiry: 0,
                ins: [
                    {
                        hash: '5fb1b570a1fd2795f4a7aea3f0b3874c4b33c1d4b7cb4c2e29456806536594ce',
                        index: 2,
                        tree: 0,
                        sequence: 4294967295,
                    },
                    {
                        hash: '6757dd66c980bff512080dfb5ea5d21c3eebdf5a69569ea3a7eb3dffd2498e4d',
                        index: 3,
                        tree: 1,
                        sequence: 4294967295,
                    },
                    {
                        hash: 'fb44485a5cdb09508d616e262ba8b05aa600ec244f95ba3a6c543f6cdeafae09',
                        index: 2,
                        tree: 0,
                        sequence: 4294967295,
                    },
                ],
                outs: [
                    {
                        value: '1763942',
                        script: '76a9141efd385c4b4fa8a0205fc9a47ef8abe160b7172388ac',
                        version: 0,
                    },
                    {
                        value: '14279220005',
                        script: '76a9141efd385c4b4fa8a0205fc9a47ef8abe160b7172388ac',
                        version: 0,
                    },
                    {
                        value: '11312223835',
                        script: '76a9148ce1b6887003bdd2e3b3bc4354a49c0230dd02db88ac',
                        version: 0,
                    },
                ],
            },
        },
        {
            description: 'Decred mainnet stakegen',
            network: 'decred',
            hex: '01000000020000000000000000000000000000000000000000000000000000000000000000ffffffff00ffffffffc28fa364613df7835d07205d5fc4be06f07bddeffb0f8ca8cef44ad21b6996d40000000001ffffffff0300000000000000000000266a24afa6e6dcf08b3e1e87b9079f2835b7a156a3d3aaf42ef30c000000000000000090e7060000000000000000000000086a060500070000000fcd9b580300000000001abb76a914dd931f55ffacd38be3cad2cb88df45681212c87388ac000000000000000002b05c65050000000000000000ffffffff0200005f703653030000003ee50600050000006a47304402204d61f42e8714c9c1da61267d20fb29855fd1f61451721fcbf05fc0dea5c4962a02201a663f706992760872109ab49153d75ca9927334f364ba9eb125cb742babe22c012103d494c352ec1a1521a083056c8694f6dced78fc2a99ed31964c58705b7ff5f814',
            id: '025a19e8bd45ea5777a4f2883e3d5faf56e2d0b69bfab5ca22343f577d8d56d6',
            hash: 'd6568d7d573f3422cab5fa9bb6d0e256af5f3d3e88f2a47757ea45bde8195a02',
            coinbase: false,
            virtualSize: 86,
            weight: 344,
            raw: {
                type: 0,
                version: 1,
                locktime: 0,
                expiry: 0,
                ins: [
                    {
                        hash: '0000000000000000000000000000000000000000000000000000000000000000',
                        index: 4294967295,
                        tree: 0,
                        script: '0000',
                        sequence: 4294967295,
                        value: '90528944',
                        height: 0,
                        blockIndex: 4294967295,
                    },
                    {
                        hash: 'c28fa364613df7835d07205d5fc4be06f07bddeffb0f8ca8cef44ad21b6996d4',
                        index: 0,
                        tree: 1,
                        script: '47304402204d61f42e8714c9c1da61267d20fb29855fd1f61451721fcbf05fc0dea5c4962a02201a663f706992760872109ab49153d75ca9927334f364ba9eb125cb742babe22c012103d494c352ec1a1521a083056c8694f6dced78fc2a99ed31964c58705b7ff5f814',
                        sequence: 4294967295,
                        value: '14280978527',
                        height: 451902,
                        blockIndex: 5,
                    },
                ],
                outs: [
                    {
                        value: '0',
                        script: '6a24afa6e6dcf08b3e1e87b9079f2835b7a156a3d3aaf42ef30c000000000000000090e70600',
                        version: 0,
                    },
                    {
                        value: '0',
                        script: '6a06050007000000',
                        version: 0,
                    },
                    {
                        value: '14371507471',
                        script: 'bb76a914dd931f55ffacd38be3cad2cb88df45681212c87388ac',
                        version: 0,
                    },
                ],
            },
        },
        {
            description: 'Decred mainnet stake submission',
            network: 'decred',
            hex: '01000000015a2400663125cdd345befe21211587798d8a1a508890a8f8fbd609818a20f6cc0000000000ffffffff03093086930300000000001aba76a9143123be63fac71b035632d7e8a9a4172ee7685e3388ac00000000000000000000206a1ed2f36be7b1d27c52191ffa6689f83d9bfaed6879ad3b8693030000000058000000000000000000001abd76a914000000000000000000000000000000000000000088ac00000000f0e7060001ad3b86930300000090e70600090000006a473044022066344f1690bce7aa64bbc49d800c14533353a8f769ceb79a926ca8d22ac5f31502201bfe6c237c961d3bd71d60c856a166ecb961b6188eadbb418fefd7c16d72953e012102b25c3d01894e5d4222e2e71952d686ace4a21d54c1ea1f8bbb0943efe05bb643',
            id: 'a7118e76698e96964b61b96176338c81bded54fbbe2dca8df38ba690ee45413d',
            hash: '3d4145ee90a68bf38dca2dbefb54edbd818c337661b9614b96968e69768e11a7',
            coinbase: false,
            virtualSize: 74,
            weight: 296,
            raw: {
                type: 0,
                version: 1,
                locktime: 0,
                expiry: 452592,
                ins: [
                    {
                        hash: '5a2400663125cdd345befe21211587798d8a1a508890a8f8fbd609818a20f6cc',
                        index: 0,
                        tree: 0,
                        script: '473044022066344f1690bce7aa64bbc49d800c14533353a8f769ceb79a926ca8d22ac5f31502201bfe6c237c961d3bd71d60c856a166ecb961b6188eadbb418fefd7c16d72953e012102b25c3d01894e5d4222e2e71952d686ace4a21d54c1ea1f8bbb0943efe05bb643',
                        sequence: 4294967295,
                        value: '15359949741',
                        height: 452496,
                        blockIndex: 9,
                    },
                ],
                outs: [
                    {
                        value: '15359946761',
                        script: 'ba76a9143123be63fac71b035632d7e8a9a4172ee7685e3388ac',
                        version: 0,
                    },
                    {
                        value: '0',
                        script: '6a1ed2f36be7b1d27c52191ffa6689f83d9bfaed6879ad3b8693030000000058',
                        version: 0,
                    },
                    {
                        value: '0',
                        script: 'bd76a914000000000000000000000000000000000000000088ac',
                        version: 0,
                    },
                ],
            },
        },
        {
            description: 'Decred mainnet coinbase',
            network: 'decred',
            hex: '01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff00ffffffff032545fe0800000000000017a914f5916158e3e2c4551c1796708db8367207ed13bb87000000000000000000000e6a0cc3e70600b760ecdc1623f3bf14b30c360000000000001976a914bd4404f16675528997da3d78cf08e1fcc0806b6b88ac00000000000000000105e4f33e0000000000000000ffffffff0800002f646372642f',
            id: '9e1dc53c45896cc4063ecc0d27a098cc3754be991ff6efc62379adcf6eb8f245',
            hash: '45f2b86ecfad7923c6eff61f99be5437cc98a0270dcc3e06c46c89453cc51d9e',
            coinbase: true,
            virtualSize: 44,
            weight: 176,
            raw: {
                type: 0,
                version: 1,
                locktime: 0,
                expiry: 0,
                ins: [
                    {
                        hash: '0000000000000000000000000000000000000000000000000000000000000000',
                        index: 4294967295,
                        tree: 0,
                        script: '00002f646372642f',
                        sequence: 4294967295,
                        value: '1056171013',
                        height: 0,
                        blockIndex: 4294967295,
                    },
                ],
                outs: [
                    {
                        value: '150881573',
                        script: 'a914f5916158e3e2c4551c1796708db8367207ed13bb87',
                        version: 0,
                    },
                    {
                        value: '0',
                        script: '6a0cc3e70600b760ecdc1623f3bf',
                        version: 0,
                    },
                    {
                        value: '906801940',
                        script: '76a914bd4404f16675528997da3d78cf08e1fcc0806b6b88ac',
                        version: 0,
                    },
                ],
            },
        },
        {
            description: 'Decred mainnet stake revocation',
            network: 'decred',
            hex: '010000000157191239913fdd25bd4f8cc9b07e26d388b8afa4301275adb9182e3454ea24ba0000000001ffffffff01a358ce380300000000001abc76a91476c79b074c68a16338b4bfd87e86175e3134efb688ac0000000000000000013b61ce38030000009ec10600060000006b483045022100d3f286ae7fffbab596db4102f365b4bf294add40f8c2ff1cb3c7ff5f18ef0dec022079b4b7a9ad9a899a3014a8ac2a148d3914d71a98e9559845c3e80369a4081fa70121038585e8b324abd735ad2814f1c75c5daf63c0d432b51ff1ca52d411007c188052',
            id: 'cf9a6d6434f18c7f6183ea6b07d07df06a77caafa7e9b23b3ab52249c4feed73',
            hash: '73edfec44922b53a3bb2e9a7afca776af07dd0076bea83617f8cf134646d9acf',
            coinbase: false,
            virtualSize: 55,
            weight: 217,
            raw: {
                type: 0,
                version: 1,
                locktime: 0,
                expiry: 0,
                ins: [
                    {
                        hash: '57191239913fdd25bd4f8cc9b07e26d388b8afa4301275adb9182e3454ea24ba',
                        index: 0,
                        tree: 1,
                        script: '483045022100d3f286ae7fffbab596db4102f365b4bf294add40f8c2ff1cb3c7ff5f18ef0dec022079b4b7a9ad9a899a3014a8ac2a148d3914d71a98e9559845c3e80369a4081fa70121038585e8b324abd735ad2814f1c75c5daf63c0d432b51ff1ca52d411007c188052',
                        sequence: 4294967295,
                        value: '13837951291',
                        height: 442782,
                        blockIndex: 6,
                    },
                ],
                outs: [
                    {
                        value: '13837949091',
                        script: 'bc76a91476c79b074c68a16338b4bfd87e86175e3134efb688ac',
                        version: 0,
                    },
                ],
            },
        },
    ],
    invalid: [
        {
            description: 'invalid version 0',
            hex: '00000000021a87c419bc4b1c364b56017810d5cb2da625a3b1cd2c709d8b7c40f4ed904c0e0100000000ffffffffda22c50537dc07139d30062e856eca7e3f7e134360a6ccb14dd418340b3f46080200000001ffffffff02ad3b86930300000000001976a914ff835d21396f19b54f7ca07709846cd10be2273a88ac664fdbda0100000000001976a9144a8db42f74eaf5cb83d5c5ff392068dedbf521b488ac000000000000000002947ef1090200000076e706000a0000006a47304402206d7f0556e32d219ac6158592f205f0142b0fc2491d3d5e4b47fcd94e273072e702205212784c68ed0fc3fb42893871eecdaff536e3151852cc622485a67697967ce7012102ec4c8f27ef27494f84489d51684ad436459c9d992b9b47636cc9c4b34fcf0972dd1c706403000000c6e60600020000006b4830450221008b0235f8c3c5a415d27e2da91e99a2e0aa32a55c63f1078cf957e47cf194ccdb022034343e1299c312e6ada0908584bca412d7653fa416f00cdafbe01be4e16bade401210399a38b70c02626ffb64451b1b5d8b95fd9f8cb02aaaf062cd8e5a023a5a2fa37',
            exception: 'Unsupported Decred transaction version',
        },
        {
            description: 'invalid type 3 only witness',
            hex: '01000300021a87c419bc4b1c364b56017810d5cb2da625a3b1cd2c709d8b7c40f4ed904c0e0100000000ffffffffda22c50537dc07139d30062e856eca7e3f7e134360a6ccb14dd418340b3f46080200000001ffffffff02ad3b86930300000000001976a914ff835d21396f19b54f7ca07709846cd10be2273a88ac664fdbda0100000000001976a9144a8db42f74eaf5cb83d5c5ff392068dedbf521b488ac000000000000000002947ef1090200000076e706000a0000006a47304402206d7f0556e32d219ac6158592f205f0142b0fc2491d3d5e4b47fcd94e273072e702205212784c68ed0fc3fb42893871eecdaff536e3151852cc622485a67697967ce7012102ec4c8f27ef27494f84489d51684ad436459c9d992b9b47636cc9c4b34fcf0972dd1c706403000000c6e60600020000006b4830450221008b0235f8c3c5a415d27e2da91e99a2e0aa32a55c63f1078cf957e47cf194ccdb022034343e1299c312e6ada0908584bca412d7653fa416f00cdafbe01be4e16bade401210399a38b70c02626ffb64451b1b5d8b95fd9f8cb02aaaf062cd8e5a023a5a2fa37',
            exception: 'Unsupported Decred transaction type',
        },
        {
            description: 'two ins but only one witness',
            hex: '01000000021a87c419bc4b1c364b56017810d5cb2da625a3b1cd2c709d8b7c40f4ed904c0e0100000000ffffffffda22c50537dc07139d30062e856eca7e3f7e134360a6ccb14dd418340b3f46080200000001ffffffff02ad3b86930300000000001976a914ff835d21396f19b54f7ca07709846cd10be2273a88ac664fdbda0100000000001976a9144a8db42f74eaf5cb83d5c5ff392068dedbf521b488ac000000000000000001947ef1090200000076e706000a0000006a47304402206d7f0556e32d219ac6158592f205f0142b0fc2491d3d5e4b47fcd94e273072e702205212784c68ed0fc3fb42893871eecdaff536e3151852cc622485a67697967ce7012102ec4c8f27ef27494f84489d51684ad436459c9d992b9b47636cc9c4b34fcf0972',
            exception: 'Non equal number of ins and witnesses',
        },
    ],
    hashforsigvalid: [
        {
            name: 'SIGHASH_ALL idx 0 of 1 input with 1 output',
            script: '210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ac',
            tx: '01000000016fa08ee1dff473b3f0a187f36a9970db313af0df7608a43c0876eba8a5b010270000000000ffffffff010000000000000000000000000000000000000001000000000000000000000000ffffffff49483045022100f5353150d31a63f4a0d06d1f5a01ac65f7267a719e49f2a1ac584fd546bef074022030e09575e7a1541aa018876a4003cefe1b061a90556b5140c63e0ef84813524801',
            idx: 0,
            hashType: 1,
            want: 'eede9a2cdeaf2139a49f6a95c5e99a083e4263af6e65e4e3854aa5c5d1e301ad',
        },
        {
            name: 'SIGHASH_ALL idx 1 of 2 input with 3 output',
            script: 'ba76a9140f91dcf59d7a03649112ba0a2a3a3beca66a473888ac',
            tx: '01000000020000000000000000000000000000000000000000000000000000000000000000ffffffff00ffffffffc89d678aa5d6604d5cec00069a9b982f1f97cb1a7a745de81499b5bca44705a10000000001ffffffff0300000000000000000000266a24d5a50f5d288e7c755c2d59eb4eeeab333a4f2176b0fbb66ba313000000000000ff0f000000000000000000000000046a0201002fd213170000000000001abb76a914d81c2a2b41089cee62c2cbd85a47acf5f5f0353d88ac0000000000000000022f10280b0000000000000000ffffffff02000000c2eb0b000000009b020000010000006b483045022100fe0d708f6db2ae1ce072f6a7791a6ccf8d0149c69fd9565a8cfa6731ef1fc0c202202a84edd000db79a72ea312885f9b19968207c69b4fb5c9174477674c2652a4c7012103d17c71464bcb71d016b974a31703813faf3bdf3b69794694eea9bb321e646c7a',
            idx: 1,
            hashType: 1,
            want: 'fa82c089367438879299258f26b4cfd8cedee3ebbb3f9c4a3e14aad530613899',
        },
        {
            name: 'SIGHASH_NONE idx 0 of 3 input with 2 output',
            script: '76a91478807bd86b22a9f23bb4e026705c3e52824d7f3e88ac',
            tx: '010000000304aacce7ca34e1f59e55d957f4d27aa6f54c5dd4046665840797ffe88b27320a0100000000ffffffff0785b51df7d46512ebd63c4dd17f391360c9d6fc5c8846a0684184a601c30c790100000000ffffffff0998d992230ab4b6ab112923bf8fd4db6bd977292ec52e722d27e389e229d1e10000000000ffffffff02e05d6a2f0000000000001976a9142fc06df75ec010d3ff25c3de77713fca4e731d4088ace09cede90500000000001976a914c2a65fb57cd570a53ff6cc721d854d5d7549f23f88ac00000000000000000300e40b540200000051010000040000006a47304402203162d5cea243874539bb6e35c9515342fcfa3fc7b8fa77ca9a17cef541c8957302204e00f31091c8f982eff563b805d1909679741c02c851919a709fce40dcd452ad012103ee327661befce7e68046a18aab5d2a566b0425069ad6b7b1951a737d40abd9cb0012c2e8010000003f010000010000006a4730440220557f6069906bc945c9139f4d2d222abc30e521a20845513897d9ddcee3cb819002205edbda2708bb8df15c3a6f6b28144247544044e320448ff4ac766630bd6532aa012103d7502318c3205e4df6d0b2e9afa4c721526421914783fb33ce2aec9d40f0b4490050d6dc010000000d010000020000006b48304502210099f5cb0ca36e68f7f815e17538706b374e24ec9e61795984f767f230ee08dea802204c908c38e647e5d551dba5054adfd0430dde19ca94d83b68a795678d5246a90d012103ee327661befce7e68046a18aab5d2a566b0425069ad6b7b1951a737d40abd9cb',
            idx: 0,
            hashType: 2,
            want: '67ce8c98109995d7b303063330ba91f332f35d32a3242f85f798460c2540fc56',
        },
        {
            name: 'SIGHASH_SINGLE idx 0 of 3 input with 2 output',
            script: '76a91478807bd86b22a9f23bb4e026705c3e52824d7f3e88ac',
            tx: '010000000304aacce7ca34e1f59e55d957f4d27aa6f54c5dd4046665840797ffe88b27320a0100000000ffffffff0785b51df7d46512ebd63c4dd17f391360c9d6fc5c8846a0684184a601c30c790100000000ffffffff0998d992230ab4b6ab112923bf8fd4db6bd977292ec52e722d27e389e229d1e10000000000ffffffff02e05d6a2f0000000000001976a9142fc06df75ec010d3ff25c3de77713fca4e731d4088ace09cede90500000000001976a914c2a65fb57cd570a53ff6cc721d854d5d7549f23f88ac00000000000000000300e40b540200000051010000040000006a47304402203162d5cea243874539bb6e35c9515342fcfa3fc7b8fa77ca9a17cef541c8957302204e00f31091c8f982eff563b805d1909679741c02c851919a709fce40dcd452ad012103ee327661befce7e68046a18aab5d2a566b0425069ad6b7b1951a737d40abd9cb0012c2e8010000003f010000010000006a4730440220557f6069906bc945c9139f4d2d222abc30e521a20845513897d9ddcee3cb819002205edbda2708bb8df15c3a6f6b28144247544044e320448ff4ac766630bd6532aa012103d7502318c3205e4df6d0b2e9afa4c721526421914783fb33ce2aec9d40f0b4490050d6dc010000000d010000020000006b48304502210099f5cb0ca36e68f7f815e17538706b374e24ec9e61795984f767f230ee08dea802204c908c38e647e5d551dba5054adfd0430dde19ca94d83b68a795678d5246a90d012103ee327661befce7e68046a18aab5d2a566b0425069ad6b7b1951a737d40abd9cb',
            idx: 0,
            hashType: 3,
            want: 'a1f4f2ced71352153ffee5dd570da5d609ecd5ce04e1db808c238554d758fb13',
        },
        {
            name: 'SIGHASH_ANYONECANPAY idx 1 of 3 input with 2 output',
            script: '76a9143e475479f9456f5059afa14d34aaa831d7eb38a288ac',
            tx: '01000000031a64c611b07c0556683ae462defa3d00385c051650b02598933627fe4c989c3c0000000000ffffffff1dc4a8031d85cfab9ad3285c73dea1a745ec01364ceb73cc3020ffe93608f4a40100000000ffffffff026ed9771261faa5df18a40f73b31bae1cda1c24f6654b2e54a7982f7fed19ad0100000000ffffffff021ba0db190000000000001976a91484bf1c08503bc24db86bf9c0a630c6196b9c47ac88acc9e451000000000000001976a914ebad8bc2381e1ca35f83dfd7ae3483d787628c3188ac000000000000000003c07fdc0b0000000053270000020000006a47304402200476bea37cfbd0be3caf7f43d6874db199e223456fbbf0a4f0756fea6936c78a02207edc0ccbd06b506073cbd49006d81a1a040acf085f26b0eea48ec41d04e555650121036113899ef9ebd2f6a7b52722f2ec08b4d6521c79572887a775c6ef4dcc284212faeeb0080000000063270000040000006b4830450221008c1a74fbcc2987db01ffc27aa90d738a0381323460bedaa9e900b661b6cc32930220078a8fb5717161576256bfd549955e2fde1cf49c010195d790997c578923d7730121023a1a32834b9bb80d82d30318f53fca12fda5dc0f8c9e124c3646838c32c2d0bc8af9b6050000000061270000010000006b483045022100858f79af249a56db0b30c93449fbec781397856825f63e9f5c4a63b6a76b11010220396b509baee33005772b3ec69f94e5f23c3672e38b6ce34a6d7fefa992891e25012103e8ba7e8125a1d75c27742d26eff8b2f2e26fa3833a0c15d212f2315b5b8bd94c',
            idx: 1,
            hashType: 192,
            want: 'a19d06e012a4ecc11eb1d2a2d464156b68e3aee442823642a21e7368e596f579',
        },
        {
            name: 'SIGHASH_ALL | SIGHASH_ANYONECANPAY idx 1 of 4 input with 2 output',
            script: 'bd76a914185d6c4ec5d74f7be05ddefb61d307a594ed6bd588ac',
            tx: '0100000004efc713d51efb84907a1d95e6b0ae5b237540dc59a42b350d504d50e70e08c75c0400000001ffffffffe7f4162ae158fc3479df30da575987a40991f883f8e53f9ead8d6c370f99ac090400000001ffffffffe06842f22f636fca8569d6992ba466fa5524fb5a41308162bda936714a9de0b50600000001ffffffff9c8549063d054fd3547e7c1409e827dc276b989a202c6601dcb720d602ae285e0a00000001ffffffff02640c22000000000000001976a914c1582082528cf831d9e278f8a4e231665c288ff288ac00e1f5050000000000001976a9143c561807dc79c18f0cee83fea6ff5b318130f39988ac0000000000000000046333a7020000000071230000170000006a473044022026cef9f3179b748b6b96ec1d8edec18f172aee32ae0176a7ea6aa180ffe04e3702204b5ffa25227b9fea211895a1902a0ce2508647000a2d0e665bd6c7f9d432d3df012103c4e292e9a0cca0711e5c4f0149abad521381d52bf304df97d15ba8acd91816fe6333a70200000000dc230000050000006b483045022100a1ec6d887eea416014833a0047e9938d5202384abf86983309e451bcdc9939ac022032deef054f181e25a5f3dad3b5a692e4b8b3a02ae58a2557b343ed08d0214fca0121033c021118ce264ecd4e6249115714d870882a9924f8fc5aa61aa5be69fa28f6e9b72f90000000000073230000150000006a47304402202940d9fcb737cd006b08ae9b68c1716874cb621cc35664886281d226926b436702203e016a162b8c42ea35134b302f15f71a49d243b4f6245ee992413f4fbe6839a50121032f3f18de0e442aa72ecc92d3b71c508a0508f6b63c182aff491f51ac862f764927a2850000000000ef250000170000006a47304402203829b184c559b58c9d6c5d537d6f6f7f754d0f7bc56e24b0b1bd3c85f8edf8cb02203fd97b3b4e00abf7c2cd90e7128f064b7f1a68d75e23d44caca878a33e63c6fd012103cf9104a1b8069e3e6c5a4750d5740c9f9e4aafb687857ea30a29e0daf21a8711',
            idx: 1,
            hashType: 129,
            want: 'ae92df5d7123b2810a3ad9d1c15a15e6e0282dbcb97147770b91017723de4aac',
        },
        {
            name: 'SIGHASH_NONE | SIGHASH_ANYONECANPAY idx 2 of 3 input with 2 output',
            script: '76a91446b7b31c6b5da4643cd7453eae3beba375fa9f4a88ac',
            tx: '010000000304aacce7ca34e1f59e55d957f4d27aa6f54c5dd4046665840797ffe88b27320a0100000000ffffffff0785b51df7d46512ebd63c4dd17f391360c9d6fc5c8846a0684184a601c30c790100000000ffffffff0998d992230ab4b6ab112923bf8fd4db6bd977292ec52e722d27e389e229d1e10000000000ffffffff02e05d6a2f0000000000001976a9142fc06df75ec010d3ff25c3de77713fca4e731d4088ace09cede90500000000001976a914c2a65fb57cd570a53ff6cc721d854d5d7549f23f88ac00000000000000000300e40b540200000051010000040000006a47304402203162d5cea243874539bb6e35c9515342fcfa3fc7b8fa77ca9a17cef541c8957302204e00f31091c8f982eff563b805d1909679741c02c851919a709fce40dcd452ad012103ee327661befce7e68046a18aab5d2a566b0425069ad6b7b1951a737d40abd9cb0012c2e8010000003f010000010000006a4730440220557f6069906bc945c9139f4d2d222abc30e521a20845513897d9ddcee3cb819002205edbda2708bb8df15c3a6f6b28144247544044e320448ff4ac766630bd6532aa012103d7502318c3205e4df6d0b2e9afa4c721526421914783fb33ce2aec9d40f0b4490050d6dc010000000d010000020000006b48304502210099f5cb0ca36e68f7f815e17538706b374e24ec9e61795984f767f230ee08dea802204c908c38e647e5d551dba5054adfd0430dde19ca94d83b68a795678d5246a90d012103ee327661befce7e68046a18aab5d2a566b0425069ad6b7b1951a737d40abd9cb',
            idx: 1,
            hashType: 130,
            want: 'c86067bf9b3656fbb98f45a90990dffd4b3740227daf45a277e984e9fb1aac44',
        },
        {
            name: 'SIGHASH_SINGLE | SIGHASH_ANYONECANPAY idx 1 of 3 input with 2 output',
            script: '76a91446b7b31c6b5da4643cd7453eae3beba375fa9f4a88ac',
            tx: '010000000304aacce7ca34e1f59e55d957f4d27aa6f54c5dd4046665840797ffe88b27320a0100000000ffffffff0785b51df7d46512ebd63c4dd17f391360c9d6fc5c8846a0684184a601c30c790100000000ffffffff0998d992230ab4b6ab112923bf8fd4db6bd977292ec52e722d27e389e229d1e10000000000ffffffff02e05d6a2f0000000000001976a9142fc06df75ec010d3ff25c3de77713fca4e731d4088ace09cede90500000000001976a914c2a65fb57cd570a53ff6cc721d854d5d7549f23f88ac00000000000000000300e40b540200000051010000040000006a47304402203162d5cea243874539bb6e35c9515342fcfa3fc7b8fa77ca9a17cef541c8957302204e00f31091c8f982eff563b805d1909679741c02c851919a709fce40dcd452ad012103ee327661befce7e68046a18aab5d2a566b0425069ad6b7b1951a737d40abd9cb0012c2e8010000003f010000010000006a4730440220557f6069906bc945c9139f4d2d222abc30e521a20845513897d9ddcee3cb819002205edbda2708bb8df15c3a6f6b28144247544044e320448ff4ac766630bd6532aa012103d7502318c3205e4df6d0b2e9afa4c721526421914783fb33ce2aec9d40f0b4490050d6dc010000000d010000020000006b48304502210099f5cb0ca36e68f7f815e17538706b374e24ec9e61795984f767f230ee08dea802204c908c38e647e5d551dba5054adfd0430dde19ca94d83b68a795678d5246a90d012103ee327661befce7e68046a18aab5d2a566b0425069ad6b7b1951a737d40abd9cb',
            idx: 1,
            hashType: 131,
            want: '09d9cb4ccb085b695be4be003399d5ea30c7804b711713bcf37ffd75f6142333',
        },
        {
            name: 'hashType not specified idx 0 of 2 input with 2 output',
            script: '76a91442d98cd9b143b7b0cb7a8d8bcc7bdb73cc8fd76588ac',
            tx: '010000000211f1f5b21af23988af1948bd92307fb159c891706af6fb4f1f624c3db5339f3a0100000000ffffffff276d1adb947ce6b6777c666e74da78339715085a7a2d83d2f13a1761eda84cb80100000000ffffffff029e1465050000000000001976a9148958fae2118d4b5d7a3884c6c2132ef7276accd788ac49ba08000000000000001976a914816de5bab0a2991b35c7ddbae5d1afc7955136d388ac00000000000000000295bb5505000000000f270000040000006b483045022100eff76ee2821fb4d1f86dc1168249916647e4eb89c2595ae82fc1574697c891400220557b67adf577d78c5f6bb494f1ec389582cb6144f49db9bcb404b128f28e5f5c012102e49ca60c09291ebd52bd677ddbe169098bf6d7f89dff9fbdb9dc6a1a6cae7734b2f62e0000000000c3260000030000006b483045022100b5a594c8ff9997aab0fe5eee2421bc85b2d6a6154636ebe9a32a38660da6477c02204833362350d890c51f8a36076e61d498c8c8b3ba0c652591d364ae591735780201210265c1ef7cd75d39596f8134b3a1f4213d252f27f2508e43b2a27ceba27ee23cb7',
            idx: 0,
            hashType: 96,
            want: 'ebc27bbd7d5dc54a875a5ab6fd28a67da51cb2a662d0e0834ac4f6e453339f89',
        },
    ],
    hashforsiginvalid: [
        {
            name: 'index out of range',
            script: '210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ac',
            tx: '01000000016fa08ee1dff473b3f0a187f36a9970db313af0df7608a43c0876eba8a5b010270000000000ffffffff010000000000000000000000000000000000000001000000000000000000000000ffffffff49483045022100f5353150d31a63f4a0d06d1f5a01ac65f7267a719e49f2a1ac584fd546bef074022030e09575e7a1541aa018876a4003cefe1b061a90556b5140c63e0ef84813524801',
            idx: 1,
            hashType: 1,
            exception: 'Index out of range.',
        },
        {
            name: 'no witness',
            script: '210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ac',
            tx: '01000100035fb1b570a1fd2795f4a7aea3f0b3874c4b33c1d4b7cb4c2e29456806536594ce0200000000ffffffff6757dd66c980bff512080dfb5ea5d21c3eebdf5a69569ea3a7eb3dffd2498e4d0300000001fffffffffb44485a5cdb09508d616e262ba8b05aa600ec244f95ba3a6c543f6cdeafae090200000000ffffffff0366ea1a000000000000001976a9141efd385c4b4fa8a0205fc9a47ef8abe160b7172388ac259b1b530300000000001976a9141efd385c4b4fa8a0205fc9a47ef8abe160b7172388ac5bd642a20200000000001976a9148ce1b6887003bdd2e3b3bc4354a49c0230dd02db88ac0000000000000000',
            idx: 0,
            hashType: 1,
            exception: 'Missing witness data.',
        },
    ],
};