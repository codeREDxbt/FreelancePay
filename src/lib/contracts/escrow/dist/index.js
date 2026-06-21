import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
if (typeof window !== "undefined") {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CBPT5TL25ZMHLC74MKGRMKMNHZD76G2PSMPDLQ3RSPRYVCG7XHXWEY76",
    }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAAAAACVWaWV3IGN1cnJlbnQgZXNjcm93IHN0YXRlIChyZWFkLW9ubHkpAAAAAAAACWdldF9zdGF0ZQAAAAAAAAAAAAABAAAH0AAAAAtFc2Nyb3dTdGF0ZQA=",
            "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAQAAAAAAAAAAAAAABkVzY3JvdwAA",
            "AAAAAAAAACZJbml0aWFsaXplIGVzY3JvdyDigJQgY2FsbGVkIGJ5IGNsaWVudAAAAAAACmluaXRpYWxpemUAAAAAAAUAAAAAAAAABmNsaWVudAAAAAAAEwAAAAAAAAAKZnJlZWxhbmNlcgAAAAAAEwAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAAAAABFtaWxlc3RvbmVfYW1vdW50cwAAAAAAA+oAAAALAAAAAAAAABZtaWxlc3RvbmVfZGVzY3JpcHRpb25zAAAAAAPqAAAAEAAAAAEAAAAE",
            "AAAAAQAAAAAAAAAAAAAACU1pbGVzdG9uZQAAAAAAAAQAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAACaWQAAAAAAAQAAAAAAAAABnN0YXR1cwAAAAAH0AAAAA9NaWxlc3RvbmVTdGF0dXMA",
            "AAAAAAAAADBFaXRoZXIgcGFydHkgY2FuIGZsYWcgYSBkaXNwdXRlIOKAlCBmdW5kcyBsb2NrZWQAAAAMZmxhZ19kaXNwdXRlAAAAAQAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAA==",
            "AAAAAQAAAAAAAAAAAAAAC0VzY3Jvd1N0YXRlAAAAAAcAAAAAAAAABmNsaWVudAAAAAAAEwAAAAAAAAAKZnJlZWxhbmNlcgAAAAAAEwAAAAAAAAAJaXNfY2xvc2VkAAAAAAAAAQAAAAAAAAALaXNfZGlzcHV0ZWQAAAAAAQAAAAAAAAAKbWlsZXN0b25lcwAAAAAD6gAAB9AAAAAJTWlsZXN0b25lAAAAAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAADHRvdGFsX2Ftb3VudAAAAAs=",
            "AAAAAAAAAEFSZXNvbHZlIGRpc3B1dGUg4oCUIGFkbWluIG9yIG11bHRpc2lnIHJlbGVhc2VzIHRvIHNwZWNpZmllZCBwYXJ0eQAAAAAAAA9yZXNvbHZlX2Rpc3B1dGUAAAAAAwAAAAAAAAAIcmVzb2x2ZXIAAAATAAAAAAAAAApyZWxlYXNlX3RvAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAA",
            "AAAAAAAAAClGcmVlbGFuY2VyIHN1Ym1pdHMgYSBtaWxlc3RvbmUgZm9yIHJldmlldwAAAAAAABBzdWJtaXRfbWlsZXN0b25lAAAAAQAAAAAAAAAMbWlsZXN0b25lX2lkAAAABAAAAAA=",
            "AAAAAAAAAC5DbGllbnQgYXBwcm92ZXMgYSBtaWxlc3RvbmUgYW5kIHJlbGVhc2VzIGZ1bmRzAAAAAAARYXBwcm92ZV9taWxlc3RvbmUAAAAAAAABAAAAAAAAAAxtaWxlc3RvbmVfaWQAAAAEAAAAAA==",
            "AAAAAgAAAAAAAAAAAAAAD01pbGVzdG9uZVN0YXR1cwAAAAAFAAAAAAAAAAAAAAAHUGVuZGluZwAAAAAAAAAAAAAAAAlTdWJtaXR0ZWQAAAAAAAAAAAAAAAAAAAhBcHByb3ZlZAAAAAAAAAAAAAAACFJlbGVhc2VkAAAAAAAAAAAAAAAIRGlzcHV0ZWQ="]), options);
        this.options = options;
    }
    fromJSON = {
        get_state: (this.txFromJSON),
        initialize: (this.txFromJSON),
        flag_dispute: (this.txFromJSON),
        resolve_dispute: (this.txFromJSON),
        submit_milestone: (this.txFromJSON),
        approve_milestone: (this.txFromJSON)
    };
}
