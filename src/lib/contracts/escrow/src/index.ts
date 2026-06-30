import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}




export type MilestoneStatus = {tag: "Pending", values: void} | {tag: "Submitted", values: void} | {tag: "Approved", values: void} | {tag: "Released", values: void} | {tag: "Disputed", values: void};


export interface Milestone {
  amount: i128;
  description: string;
  id: u32;
  status: MilestoneStatus;
}


export interface EscrowState {
  admin: string;
  client: string;
  freelancer: string;
  initialized: boolean;
  is_closed: boolean;
  is_disputed: boolean;
  milestones: Array<Milestone>;
  token: string;
  total_amount: i128;
}

export type DataKey = {tag: "Escrow", values: void};

export const Errors = {
  1: {message:"AlreadyInitialized"},
  2: {message:"NotInitialized"},
  3: {message:"NotDisputed"},
  4: {message:"Unauthorized"},
  5: {message:"InsufficientBalance"},
  6: {message:"InvalidMilestoneId"},
  7: {message:"InvalidStatus"},
  8: {message:"NotAParty"}
}

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({client, freelancer, token, milestone_amounts, milestone_descriptions}: {client: string, freelancer: string, token: string, milestone_amounts: Array<i128>, milestone_descriptions: Array<string>}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a submit_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  submit_milestone: ({milestone_id}: {milestone_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a approve_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  approve_milestone: ({milestone_id}: {milestone_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a flag_dispute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  flag_dispute: ({caller}: {caller: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a resolve_dispute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  resolve_dispute: ({resolver, release_to, amount}: {resolver: string, release_to: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_state transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_state: (options?: MethodOptions) => Promise<AssembledTransaction<EscrowState>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAD01pbGVzdG9uZVN0YXR1cwAAAAAFAAAAAAAAAAAAAAAHUGVuZGluZwAAAAAAAAAAAAAAAAlTdWJtaXR0ZWQAAAAAAAAAAAAAAAAAAAhBcHByb3ZlZAAAAAAAAAAAAAAACFJlbGVhc2VkAAAAAAAAAAAAAAAIRGlzcHV0ZWQ=",
        "AAAAAQAAAAAAAAAAAAAACU1pbGVzdG9uZQAAAAAAAAQAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAACaWQAAAAAAAQAAAAAAAAABnN0YXR1cwAAAAAH0AAAAA9NaWxlc3RvbmVTdGF0dXMA",
        "AAAAAQAAAAAAAAAAAAAAC0VzY3Jvd1N0YXRlAAAAAAkAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAGY2xpZW50AAAAAAATAAAAAAAAAApmcmVlbGFuY2VyAAAAAAATAAAAAAAAAAtpbml0aWFsaXplZAAAAAABAAAAAAAAAAlpc19jbG9zZWQAAAAAAAABAAAAAAAAAAtpc19kaXNwdXRlZAAAAAABAAAAAAAAAAptaWxlc3RvbmVzAAAAAAPqAAAH0AAAAAlNaWxlc3RvbmUAAAAAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAMdG90YWxfYW1vdW50AAAACw==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAQAAAAAAAAAAAAAABkVzY3JvdwAA",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACAAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAABAAAAAAAAAA5Ob3RJbml0aWFsaXplZAAAAAAAAgAAAAAAAAALTm90RGlzcHV0ZWQAAAAAAwAAAAAAAAAMVW5hdXRob3JpemVkAAAABAAAAAAAAAATSW5zdWZmaWNpZW50QmFsYW5jZQAAAAAFAAAAAAAAABJJbnZhbGlkTWlsZXN0b25lSWQAAAAAAAYAAAAAAAAADUludmFsaWRTdGF0dXMAAAAAAAAHAAAAAAAAAAlOb3RBUGFydHkAAAAAAAAI",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABQAAAAAAAAAGY2xpZW50AAAAAAATAAAAAAAAAApmcmVlbGFuY2VyAAAAAAATAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAAEW1pbGVzdG9uZV9hbW91bnRzAAAAAAAD6gAAAAsAAAAAAAAAFm1pbGVzdG9uZV9kZXNjcmlwdGlvbnMAAAAAA+oAAAAQAAAAAQAAAAQ=",
        "AAAAAAAAAAAAAAAQc3VibWl0X21pbGVzdG9uZQAAAAEAAAAAAAAADG1pbGVzdG9uZV9pZAAAAAQAAAAA",
        "AAAAAAAAAAAAAAARYXBwcm92ZV9taWxlc3RvbmUAAAAAAAABAAAAAAAAAAxtaWxlc3RvbmVfaWQAAAAEAAAAAA==",
        "AAAAAAAAAAAAAAAMZmxhZ19kaXNwdXRlAAAAAQAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAPcmVzb2x2ZV9kaXNwdXRlAAAAAAMAAAAAAAAACHJlc29sdmVyAAAAEwAAAAAAAAAKcmVsZWFzZV90bwAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
        "AAAAAAAAAAAAAAAJZ2V0X3N0YXRlAAAAAAAAAAAAAAEAAAfQAAAAC0VzY3Jvd1N0YXRlAA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<u32>,
        submit_milestone: this.txFromJSON<null>,
        approve_milestone: this.txFromJSON<null>,
        flag_dispute: this.txFromJSON<null>,
        resolve_dispute: this.txFromJSON<null>,
        get_state: this.txFromJSON<EscrowState>
  }
}