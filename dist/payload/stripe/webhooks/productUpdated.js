"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productUpdated = void 0;
var logs = false;
var productUpdated = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var event, payload, stripe, stripeProductID, payloadProductID, productQuery, error_1, message, prices, error_2, error_3;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                event = args.event, payload = args.payload, stripe = args.stripe;
                stripeProductID = event.data.object.id;
                if (logs)
                    payload.logger.info("Syncing Stripe product with ID: ".concat(stripeProductID, " to Payload..."));
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                if (logs)
                    payload.logger.info("- Looking up existing Payload product...");
                return [4 /*yield*/, payload.find({
                        collection: 'products',
                        where: {
                            stripeProductID: {
                                equals: stripeProductID,
                            },
                        },
                    })];
            case 2:
                productQuery = _c.sent();
                payloadProductID = (_b = (_a = productQuery.docs) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id;
                if (payloadProductID) {
                    if (logs)
                        payload.logger.info("- Found existing product with Stripe ID: ".concat(stripeProductID, ", syncing now..."));
                }
                return [3 /*break*/, 4];
            case 3:
                error_1 = _c.sent();
                message = error_1 instanceof Error ? error_1.message : 'Unknown error';
                payload.logger.error("Error finding product ".concat(message));
                return [3 /*break*/, 4];
            case 4:
                _c.trys.push([4, 6, , 7]);
                if (logs)
                    payload.logger.info("- Looking up all prices associated with this product...");
                return [4 /*yield*/, stripe.prices.list({
                        product: stripeProductID,
                        limit: 100,
                    })];
            case 5:
                // find all stripe prices that are assigned to "payloadProductID"
                prices = _c.sent();
                return [3 /*break*/, 7];
            case 6:
                error_2 = _c.sent();
                payload.logger.error("- Error looking up prices: ".concat(error_2));
                return [3 /*break*/, 7];
            case 7:
                _c.trys.push([7, 9, , 10]);
                if (logs)
                    payload.logger.info("- Updating document...");
                return [4 /*yield*/, payload.update({
                        collection: 'products',
                        id: payloadProductID,
                        data: {
                            // name: stripeProductName,
                            // description: stripeDescription,
                            priceJSON: JSON.stringify(prices),
                            skipSync: true,
                        },
                    })];
            case 8:
                _c.sent();
                if (logs)
                    payload.logger.info("\u2705 Successfully updated product.");
                return [3 /*break*/, 10];
            case 9:
                error_3 = _c.sent();
                payload.logger.error("- Error updating product: ".concat(error_3));
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); };
exports.productUpdated = productUpdated;
