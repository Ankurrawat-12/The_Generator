import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { preview } from "../assets";
import { getRandomPrompt } from "../utils";
import { FormField, Loader } from "../components";

const CreatePost = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        prompt: "",
        photo: "",
    });
    const [generatingImage, setGeneratingImage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [disableGenerateButton, setDisableGenerateButton] = useState(true);
    const [generatedPrompt, setGeneratedPrompt] = useState("");

    const generateImage = async () => {
        if (form.prompt) {
            try {
                setGeneratingImage(true);
                setDisableGenerateButton(true);
                const response = await fetch(
                    "https://the-generator.onrender.com/api/v1/generator",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ prompt: form.prompt }),
                    }
                );

                const data = await response.json();
                setForm({
                    ...form,
                    // photo: data.photo,
                    photo: `data:image/jpeg;base64,${data.photo}`,
                });
                
                setGeneratedPrompt(form.prompt);
                
            } catch (error) {
                alert(error.message);
            } finally {
                setGeneratingImage(false);
            }
        } else {
            alert("please Enter a Prompt");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.prompt && form.photo) {
            setLoading(true);
            try {
                const response = await fetch(
                    "https://the-generator.onrender.com/api/v1/post",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(form),
                    }
                );

                await response.json();
                navigate("/");
            } catch (error) {
                alert(error);
            } finally {
                setLoading(false);
            }
        } else {
            alert("Please enter a prompt and generate an image");
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        console.log(form);
        if (e.target.name === "prompt" && e.target.value !== generatedPrompt) {
            setDisableGenerateButton(false);
        } else {
            setDisableGenerateButton(true);
        }
    };

    const handleSurpriseMe = () => {
        const randomPrompt = getRandomPrompt(form.prompt);
        setForm({ ...form, prompt: randomPrompt });
    };

    return (
        <section className="max-w-7xl mx-auto ">
            <div>
                <h1 className="font-extrabold text-[#222328] text-[32px]">
                    Create
                </h1>
                <p className="mt-2 text-[#666e75] text-[16px] max-w-[500px]">
                    Create imaginative and visually stunning images through The
                    Generator and share them with the community
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-16 max-w-3xl">
                <div className="flex flex-col gap-5">
                    <FormField
                        LabelName="Your name"
                        type="text"
                        name="name"
                        placeholder="Ankur Rawat"
                        value={form.name}
                        handleChange={handleChange}
                    />
                    <FormField
                        LabelName="Prompt"
                        type="text"
                        name="prompt"
                        placeholder="A carnival on the moon with zero-gravity rides"
                        value={form.prompt}
                        handleChange={handleChange}
                        isSurpriseMe
                        handleSurpriseMe={handleSurpriseMe}
                    />

                    <div className="relative bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-64 p-3 h-64 flex justify-center items-center">
                        {form.photo ? (
                            <img
                                src={form.photo}
                                alt={form.prompt}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <img
                                src={preview}
                                alt="preview"
                                className="w-9/12 h-9/12 object-contain opacity-40"
                            />
                        )}
                        {generatingImage && (
                            <div className="absolute inset-0 z-0 flex justify-center items-center bg-[rgba(0,0,0,0.5)] rounded-lg">
                                <Loader />
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-5 flex gap-5">
                    <button
                        type="button"
                        onClick={generateImage}
                        disabled={disableGenerateButton}
                        className="text-white disabled:opacity-50 bg-green-700 font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                    >
                        {generatingImage
                            ? "Generating Image..."
                            : "Generate Image"}
                    </button>
                </div>
                <div className="mt-10">
                    <p className="mt-2 text-[#666e75] text-[14px]">
                        Once you have created the image you want, you can share
                        it with others in community
                    </p>
                    <button
                        type="submit"
                        className="mt-3 text-white bg-[#6469ff] font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                    >
                        {loading ? "Sharing..." : "Share With the community"}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default CreatePost;
