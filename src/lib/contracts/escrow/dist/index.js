import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
if (typeof window !== "undefined") {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const Errors = {
    1: { message: "AlreadyInitialized" },
    2: { message: "NotInitialized" },
    3: { message: "NotDisputed" },
    4: { message: "Unauthorized" },
    5: { message: "InsufficientBalance" },
    6: { message: "InvalidMilestoneId" },
    7: { message: "InvalidStatus" },
    8: { message: "NotAParty" }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAgAAAAAAAAAAAAAAD01pbGVzdG9uZVN0YXR1cwAAAAAFAAAAAAAAAAAAAAAHUGVuZGluZwAAAAAAAAAAAAAAAAlTdWJtaXR0ZWQAAAAAAAAAAAAAAAAAAAhBcHByb3ZlZAAAAAAAAAAAAAAACFJlbGVhc2VkAAAAAAAAAAAAAAAIRGlzcHV0ZWQ=",
            "AAAAAQAAAAAAAAAAAAAACU1pbGVzdG9uZQAAAAAAAAQAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAACaWQAAAAAAAQAAAAAAAAABnN0YXR1cwAAAAAH0AAAAA9NaWxlc3RvbmVTdGF0dXMA",
            "AAAAAQAAAAAAAAAAAAAAC0VzY3Jvd1N0YXRlAAAAAAkAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAGY2xpZW50AAAAAAATAAAAAAAAAApmcmVlbGFuY2VyAAAAAAATAAAAAAAAAAtpbml0aWFsaXplZAAAAAABAAAAAAAAAAlpc19jbG9zZWQAAAAAAAABAAAAAAAAAAtpc19kaXNwdXRlZAAAAAABAAAAAAAAAAptaWxlc3RvbmVzAAAAAAPqAAAH0AAAAAlNaWxlc3RvbmUAAAAAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAMdG90YWxfYW1vdW50AAAACw==",
            "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAQAAAAAAAAAAAAAABkVzY3JvdwAA",
            "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACAAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAABAAAAAAAAAA5Ob3RJbml0aWFsaXplZAAAAAAAAgAAAAAAAAALTm90RGlzcHV0ZWQAAAAAAwAAAAAAAAAMVW5hdXRob3JpemVkAAAABAAAAAAAAAATSW5zdWZmaWNpZW50QmFsYW5jZQAAAAAFAAAAAAAAABJJbnZhbGlkTWlsZXN0b25lSWQAAAAAAAYAAAAAAAAADUludmFsaWRTdGF0dXMAAAAAAAAHAAAAAAAAAAlOb3RBUGFydHkAAAAAAAAI",
            "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABQAAAAAAAAAGY2xpZW50AAAAAAATAAAAAAAAAApmcmVlbGFuY2VyAAAAAAATAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAAEW1pbGVzdG9uZV9hbW91bnRzAAAAAAAD6gAAAAsAAAAAAAAAFm1pbGVzdG9uZV9kZXNjcmlwdGlvbnMAAAAAA+oAAAAQAAAAAQAAAAQ=",
            "AAAAAAAAAAAAAAAQc3VibWl0X21pbGVzdG9uZQAAAAEAAAAAAAAADG1pbGVzdG9uZV9pZAAAAAQAAAAA",
            "AAAAAAAAAAAAAAARYXBwcm92ZV9taWxlc3RvbmUAAAAAAAABAAAAAAAAAAxtaWxlc3RvbmVfaWQAAAAEAAAAAA==",
            "AAAAAAAAAAAAAAAMZmxhZ19kaXNwdXRlAAAAAQAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAA==",
            "AAAAAAAAAAAAAAAPcmVzb2x2ZV9kaXNwdXRlAAAAAAMAAAAAAAAACHJlc29sdmVyAAAAEwAAAAAAAAAKcmVsZWFzZV90bwAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
            "AAAAAAAAAAAAAAAJZ2V0X3N0YXRlAAAAAAAAAAAAAAEAAAfQAAAAC0VzY3Jvd1N0YXRlAA=="]), options);
        this.options = options;
    }
    fromJSON = {
        initialize: (this.txFromJSON),
        submit_milestone: (this.txFromJSON),
        approve_milestone: (this.txFromJSON),
        flag_dispute: (this.txFromJSON),
        resolve_dispute: (this.txFromJSON),
        get_state: (this.txFromJSON)
    };
}
