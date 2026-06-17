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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
exports.generateClipTitle = generateClipTitle;
exports.generateClipDescription = generateClipDescription;
exports.getClipRecommendations = getClipRecommendations;
exports.moderateContent = moderateContent;
exports.suggestClipHighlights = suggestClipHighlights;
exports.generateThumbnailPrompt = generateThumbnailPrompt;
exports.generateThumbnailImage = generateThumbnailImage;
var openai_1 = require("openai");
// Use local Ollama with OpenAI-compatible API
var openai = new openai_1.default({
    apiKey: "ollama",
    baseURL: "http://localhost:11434/v1",
});
var MODEL = "gemma4";
/**
 * Generate an optimized title for an audio clip based on context
 */
function generateClipTitle(clipContent, showName, duration) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt_1, response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    prompt_1 = "Generate a catchy, SEO-friendly title for a podcast clip from \"".concat(showName, "\"\n    that is ").concat(Math.round(duration), " seconds long. The clip content is about: \"").concat(clipContent, "\".\n    The title should be concise (max 60 chars) and compelling to drive clicks.\n    Respond with the title only, no quotes or explanations.");
                    return [4 /*yield*/, openai.chat.completions.create({
                            model: MODEL,
                            messages: [{ role: "user", content: prompt_1 }],
                            temperature: 0.7,
                            max_tokens: 60,
                        })];
                case 1:
                    response = _b.sent();
                    return [2 /*return*/, ((_a = response.choices[0].message.content) === null || _a === void 0 ? void 0 : _a.trim()) || "".concat(showName, " - Highlight Clip")];
                case 2:
                    error_1 = _b.sent();
                    console.error("Error generating clip title:", error_1);
                    return [2 /*return*/, "".concat(showName, " - Highlight Clip")];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Generate an engaging description for an audio clip
 */
function generateClipDescription(clipContent, showName) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt_2, response, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    prompt_2 = "Write an engaging, SEO-optimized description for a podcast clip from \"".concat(showName, "\".\n    The clip is about: \"").concat(clipContent, "\".\n    Keep the description under 200 characters, include relevant keywords, and make it enticing.\n    Respond with the description only, no quotes or explanations.");
                    return [4 /*yield*/, openai.chat.completions.create({
                            model: MODEL,
                            messages: [{ role: "user", content: prompt_2 }],
                            temperature: 0.7,
                            max_tokens: 200,
                        })];
                case 1:
                    response = _b.sent();
                    return [2 /*return*/, ((_a = response.choices[0].message.content) === null || _a === void 0 ? void 0 : _a.trim()) || ""];
                case 2:
                    error_2 = _b.sent();
                    console.error("Error generating clip description:", error_2);
                    return [2 /*return*/, ""];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Generate clip recommendations for a user based on their preferences
 */
function getClipRecommendations(userInterests, recentActivity, availableClipTopics) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt_3, response, content, jsonMatch, parsed, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    prompt_3 = "Based on a user with interests in ".concat(userInterests.join(", "), "\n    who recently ").concat(recentActivity, ", recommend 5 podcast clip topics they might enjoy from this list:\n    ").concat(availableClipTopics.join(", "), "\n\n    Return your recommendations as a JSON object with a \"recommendations\" array of strings containing only the topic names. Example: {\"recommendations\": [\"topic1\", \"topic2\"]}");
                    return [4 /*yield*/, openai.chat.completions.create({
                            model: MODEL,
                            messages: [{ role: "user", content: prompt_3 }],
                            temperature: 0.7,
                        })];
                case 1:
                    response = _a.sent();
                    content = response.choices[0].message.content;
                    if (!content)
                        return [2 /*return*/, []];
                    try {
                        jsonMatch = content.match(/\{[\s\S]*\}/);
                        if (!jsonMatch)
                            return [2 /*return*/, []];
                        parsed = JSON.parse(jsonMatch[0]);
                        return [2 /*return*/, Array.isArray(parsed.recommendations) ? parsed.recommendations : []];
                    }
                    catch (e) {
                        console.error("Error parsing JSON from model response:", e);
                        return [2 /*return*/, []];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error("Error getting clip recommendations:", error_3);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Moderate user-generated content using the local model
 */
function moderateContent(content) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt_4, response, text, jsonMatch, parsed, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    prompt_4 = "You are a content moderator. Review the following content and determine if it violates community guidelines (hate speech, explicit violence, sexual content, spam, harassment).\n\n    Content: \"".concat(content, "\"\n\n    Respond with a JSON object: {\"appropriate\": true/false, \"reason\": \"brief reason if not appropriate\"}");
                    return [4 /*yield*/, openai.chat.completions.create({
                            model: MODEL,
                            messages: [{ role: "user", content: prompt_4 }],
                            temperature: 0,
                            max_tokens: 100,
                        })];
                case 1:
                    response = _a.sent();
                    text = response.choices[0].message.content || "";
                    jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (!jsonMatch)
                        return [2 /*return*/, { isAppropriate: true }];
                    parsed = JSON.parse(jsonMatch[0]);
                    return [2 /*return*/, {
                            isAppropriate: parsed.appropriate !== false,
                            reason: parsed.reason,
                        }];
                case 2:
                    error_4 = _a.sent();
                    console.error("Error moderating content:", error_4);
                    return [2 /*return*/, { isAppropriate: true }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Generate clip suggestions from a full podcast episode
 */
function suggestClipHighlights(transcriptSegments, showName) {
    return __awaiter(this, void 0, void 0, function () {
        var fullTranscript, prompt_5, response, content, jsonMatch, parsed, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    fullTranscript = transcriptSegments
                        .map(function (s) { return "[".concat(s.timestamp, "s] ").concat(s.text); })
                        .join(" ");
                    prompt_5 = "Analyze this podcast transcript from \"".concat(showName, "\" and identify 3-5 segments that would make excellent short clips.\n    Look for segments that are insightful, entertaining, controversial, or emotionally impactful.\n    Ideal clips should be 15-60 seconds in context.\n\n    Transcript with timestamps:\n    ").concat(fullTranscript, "\n\n    Return a JSON object with a \"suggestions\" array. Each item has: timestamp (number), text (string), confidence (0-1). Example: {\"suggestions\": [{\"timestamp\": 10, \"text\": \"...\", \"confidence\": 0.9}]}");
                    return [4 /*yield*/, openai.chat.completions.create({
                            model: MODEL,
                            messages: [{ role: "user", content: prompt_5 }],
                            temperature: 0.5,
                        })];
                case 1:
                    response = _a.sent();
                    content = response.choices[0].message.content;
                    if (!content)
                        return [2 /*return*/, []];
                    try {
                        jsonMatch = content.match(/\{[\s\S]*\}/);
                        if (!jsonMatch)
                            return [2 /*return*/, []];
                        parsed = JSON.parse(jsonMatch[0]);
                        return [2 /*return*/, Array.isArray(parsed.suggestions) ? parsed.suggestions : []];
                    }
                    catch (e) {
                        console.error("Error parsing JSON from model response:", e);
                        return [2 /*return*/, []];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    console.error("Error suggesting clip highlights:", error_5);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Generate thumbnail prompt for clip visualization
 */
function generateThumbnailPrompt(clipContent, showName) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt_6, response, error_6;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    prompt_6 = "Create an image prompt to generate a thumbnail for a podcast clip.\n    The podcast is called \"".concat(showName, "\" and the clip is about: \"").concat(clipContent, "\".\n    The thumbnail should be visually appealing, relevant to the content, and suitable for social media.\n    Make the prompt detailed, specific, and creative. Focus on creating an image that would make someone click.\n    Respond with the image prompt only, no explanations.");
                    return [4 /*yield*/, openai.chat.completions.create({
                            model: MODEL,
                            messages: [{ role: "user", content: prompt_6 }],
                            temperature: 0.8,
                            max_tokens: 200,
                        })];
                case 1:
                    response = _b.sent();
                    return [2 /*return*/, ((_a = response.choices[0].message.content) === null || _a === void 0 ? void 0 : _a.trim()) || ""];
                case 2:
                    error_6 = _b.sent();
                    console.error("Error generating thumbnail prompt:", error_6);
                    return [2 /*return*/, ""];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Image generation not supported with local Ollama — returns null
 */
function generateThumbnailImage(_prompt) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, null];
        });
    });
}
