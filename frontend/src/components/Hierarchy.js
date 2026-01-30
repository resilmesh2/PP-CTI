/*
 * Copyright (C) 2025 Ekam Puri Nieto (UMU), Antonio Skarmeta Gomez
 * (UMU), Jorge Bernal Bernabe (UMU), Juan Hernandez Acosta (UMU).
 *
 * See LICENSE file in the project root for details.
 */

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { v4 as uuidv4 } from "uuid";

const Hierarchy = forwardRef(({ onGenerateHierarchy }, ref) => {
  const needhierarchy = [
    "quasi",
    "t-clos-hierachical",
    "suppression",
    "generalization",
    "quasi/k-anonymity",
  ];
  const needalsolevel = ["suppression", "generalization"];

  //seted on file read
  const [flagatt, setFlagatt] = useState(false);
  const [flagobj, setFlagobj] = useState(false);

  //retrieved on file read
  const [attribute_list, setAttribute_list] = useState([]);
  const [object_list, setObject_list] = useState([]);
  //for level checking
  const [attribute_level_list, setAttribute_level_list] = useState([]);
  const [object_level_list, setObject_level_list] = useState([]);

  const [hattributes, setHattributes] = useState([
    { name: "", type: "", hierarchies: [[""]] },
  ]);
  const [hobjects, setHobjects] = useState([
    { name: "", attributes: [{ name: "", type: "", hierarchies: [[""]] }] },
  ]);
  const [creator, setCreator] = useState("");
  const [organization, setOrganization] = useState("");
  const [version, setVersion] = useState("");

  const [filename, setFilename] = useState("");

  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => {
        setToastVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastVisible]);

  const showToast = (message) => {
    setToastMsg(message);
    setToastVisible(true);
  };


  // Exponer la función para que pueda ser llamada desde App.js
  useImperativeHandle(ref, () => ({
    triggerHierarchyGeneration: () => handleSubmit(),
  }));

  const handleCreator = (event) => {
    setCreator(event.target.value);
  };

  const handleOrganization = (event) => {
    setOrganization(event.target.value);
  };

  const handleVersion = (event) => {
    setVersion(event.target.value);
  };

  const addAttribute = () => {
    let atbs = [...hattributes];
    atbs.push({ name: "", type: "", hierarchies: [[""]] });
    setHattributes(atbs);
  };

  const removeAttribute = (index) => {
    let atbs = [...hattributes];
    atbs.splice(index, 1);
    setHattributes(atbs);
  };

  const handleChangeAttributeName = (event, index) => {
    let name = event.target.value;
    let atbs = [...hattributes];
    let names = atbs.map((a) => a.name);
    if (names.includes(name)) {
      alert("Only 1 policy per attribute");
    } else {
      let att = atbs[index];
      att.name = name;
      att.type = "";
      att.hierarchies = [[""]];
      setHattributes(atbs);
    }
  };

  const handleChangeAttributeType = (event, index) => {
    let type = event.target.value;
    let atbs = [...hattributes];
    let att = atbs[index];
    att.type = type;
    if (type === "regex") {
      let firstLevel = att.hierarchies[0] || [""];
      att.hierarchies = [firstLevel];
    } else if (type === "interval") {
      att.hierarchies = att.hierarchies.map((h) => {
        if (h.length < 3) {
            let newH = [...h];
            while(newH.length < 3) newH.push("");
            return newH;
        }
        return h;
      });
    }
    setHattributes(atbs);
  };

  const handleChangeAttributeHierarchyElement = (event, index, index_h, index_e) => {
    let val = event.target.value;
    let atbs = [...hattributes];
    atbs[index].hierarchies[index_h][index_e] = val;
    setHattributes(atbs);
  };

  const handleAddAttributeHierarchyElement = (index, index_h) => {
    let atbs = [...hattributes];
    if (atbs[index].type === 'interval') {
      let len = atbs[index].hierarchies[index_h].length;
      atbs[index].hierarchies[index_h].splice(len - 1, 0, "");
    } else {
      atbs[index].hierarchies[index_h].push("");
    }
    setHattributes(atbs);
  };

  const handleRemoveAttributeHierarchyElement = (index, index_h, index_e) => {
    let atbs = [...hattributes];
    let minLen = atbs[index].type === 'interval' ? 3 : 1;
    if (atbs[index].hierarchies[index_h].length <= minLen) {
      showToast(`Minimum ${minLen} element${minLen > 1 ? 's' : ''} per hierarchy level required.`);
      return;
    }
    atbs[index].hierarchies[index_h].splice(index_e, 1);
    setHattributes(atbs);
  };

  const handleAddAttributeHierarchy = (index, index_h) => {
    let atbs = [...hattributes];
    let newLevel = atbs[index].type === 'interval' ? ["", "", ""] : [""];
    atbs[index].hierarchies.splice(index_h + 1, 0, newLevel);
    setHattributes(atbs);
  };

  const handleRemoveAttributeHierarchy = (index, index_h) => {
    let atbs = [...hattributes];
    if (atbs[index].hierarchies.length <= 1) {
      showToast("Minimum 1 hierarchy level required.");
      return;
    }
    atbs[index].hierarchies.splice(index_h, 1);
    setHattributes(atbs);
  };

  const addObject = () => {
    let objs = [...hobjects];
    objs.push({
      name: "",
      attributes: [{ name: "", type: "", hierarchies: [[""]] }],
    });
    setHobjects(objs);
  };

  const removeObject = (index) => {
    let objs = [...hobjects];
    objs.splice(index, 1);
    setHobjects(objs);
  };

  const addObjectAttribute = (index_o, index_a) => {
    let objs = [...hobjects];
    let atbs = objs[index_o].attributes;
    atbs.splice(index_a + 1, 0, { name: "", type: "", hierarchies: [[""]] });
    setHobjects(objs);
  };

  const removeObjectAttribute = (index_o, index_a) => {
    let objs = [...hobjects];
    let atbs = objs[index_o].attributes;
    atbs.splice(index_a, 1);
    setHobjects(objs);
  };

  const handleChangeObjectName = (event, index) => {
    let name = event.target.value;
    let objs = [...hobjects];
    let names = objs.map((el) => el.name);
    if (names.includes(name)) {
      alert("Only 1 hierarchy policy per object");
    } else {
      objs[index].name = name;
      setHobjects(objs);
    }
  };

  const handleChangeObjectAttributeName = (event, index_o, index_a) => {
    let name = event.target.value;
    let objs = [...hobjects];
    let names = objs[index_o].attributes.map((el) => el.name);
    if (names.includes(name)) {
      alert("Only 1 hierarchy policy per attribute");
    } else {
      let att = (objs[index_o].attributes[index_a].name = name);
      setHobjects(objs);
    }
  };

  const handleChangeObjectAttributeType = (event, index_o, index_a) => {
    let type = event.target.value;
    let objs = [...hobjects];
    let att = objs[index_o].attributes[index_a];
    att.type = type;
    if (type === "regex") {
      let firstLevel = att.hierarchies[0] || [""];
      att.hierarchies = [ firstLevel ];
    } else if (type === 'interval') {
      att.hierarchies = att.hierarchies.map((h) => {
        if (h.length < 3) {
            let newH = [...h];
            while(newH.length < 3) newH.push("");
            return newH;
        }
        return h;
      });
    }
    setHobjects(objs);
  };

  const handleChangeObjectAttributeHierarchyElement = (
    event,
    index_o,
    index_a,
    index_h,
    index_e
  ) => {
    let val = event.target.value;
    let objs = [...hobjects];
    objs[index_o].attributes[index_a].hierarchies[index_h][index_e] = val;
    setHobjects(objs);
  };

  const handleAddObjectAttributeHierarchyElement = (index_o, index_a, index_h) => {
    let objs = [...hobjects];
    let att = objs[index_o].attributes[index_a];
    if (att.type === 'interval') {
      let len = att.hierarchies[index_h].length;
      att.hierarchies[index_h].splice(len - 1, 0, "");
    } else {
      att.hierarchies[index_h].push("");
    }
    setHobjects(objs);
  }

  const handleRemoveObjectAttributeHierarchyElement = (index_o, index_a, index_h, index_e) => {
    let objs = [...hobjects];
    let att = objs[index_o].attributes[index_a];
    let minLen = att.type === 'interval' ? 3 : 1;

    if (att.hierarchies[index_h].length <= minLen) {
      showToast(`Minimum ${minLen} element${minLen > 1 ? 's' : ''} per hierarchy level required.`);
      return;
    } 
    att.hierarchies[index_h].splice(index_e, 1);
    setHobjects(objs);
  }

  const handleAddObjectAttributeHierarchy = (index_o, index_a, index_h) => {
    let objs = [...hobjects];
    let att = objs[index_o].attributes[index_a];
    let newLevel = att.type === 'interval' ? ["", "", ""] : [""];
    att.hierarchies.splice(index_h + 1, 0, newLevel);
    setHobjects(objs);
  };

  const handleRemoveObjectAttributeHierarchy = (index_o, index_a, index_h) => {
    let objs = [...hobjects];
    if (objs[index_o].attributes[index_a].hierarchies.length <= 1) {
      showToast("Minimum 1 hierarchy level required.");
      return;
    }
    objs[index_o].attributes[index_a].hierarchies.splice(index_h, 1);
    setHobjects(objs);
  };

  let fileReader;
  const handleFisleChosen = (file) => {
    if (file != null) {
      fileReader = new FileReader();
      fileReader.onloadend = function () {
        const content = fileReader.result;
        console.log(content);
        try {
          //parsear evento
          let parseTojson = JSON.parse(content);
          console.log(content);
          let attributes = parseTojson["Privacy-policy"]["attributes"];
          console.log(attributes);
          let objects = parseTojson["Privacy-policy"]["templates"];
          if (attributes !== undefined && attributes.length > 0) {
            if (flagobj) {
              setFlagobj(false);
              setObject_list([]);
              setHobjects([
                {
                  name: "",
                  attributes: [{ name: "", type: "", hierarchies: [[""]] }],
                },
              ]);
            }
            console.log("attributes");
            let att_list = [];
            attributes.forEach((attribute) => {
              if (!att_list.includes(attribute["name"])) {
                let pet = attribute.pets[0];
                if (needhierarchy.includes(pet.scheme))
                  att_list.push(attribute.name);
                //att_list.push(attribute.name)
              }
              if (needalsolevel.includes(attribute.pets[0].scheme)) {
                attribute_level_list.push({
                  name: attribute.name,
                  level: attribute.pets[0].metadata.level,
                });
              }
            });
            setAttribute_list(att_list);
            setFlagatt(true);
            setFilename(file.name);
          } else if (objects !== undefined && objects.length > 0) {
            if (flagatt) {
              setFlagatt(false);
              setAttribute_list([]);
              setHattributes([{ name: "", type: "", hierarchies: [[""]] }]);
            }
            console.log("object list");
            let obj_list = [];
            objects.forEach((object) => {
              if (!obj_list.some((o) => o.name === object.name)) {
                // obj_list.push({"name": object.name, "attributes": []});
                obj_list.push(object);
                console.log("push " + object.name);
              }
              object.attributes.forEach((attribute) => {
                let obj = obj_list.find((el) => {
                  return el.name === object.name;
                });
                if (!obj.attributes.includes(attribute.name)) {
                  let pet = attribute.pets[0];
                  if (needhierarchy.includes(pet.scheme)) {
                    console.log("push " + attribute.name);
                    obj.attributes.push(attribute.name);
                  }
                }
              });
            });
            setObject_list(obj_list);
            console.log(`Set object list`);
            console.log(obj_list);
            setFlagobj(true);
            setFilename(file.name);
          }
        } catch (error) {
          alert("policy file not correct");
        }
      };
      fileReader.onerror = errorfile;
      fileReader.readAsText(file);
    }
  };

  const errorfile = () => {
    console.log("error reading file");
  };

  const handleSubmit = (e) => {
    return new Promise((resolve, reject) => {
      // e.preventDefault()
      e?.preventDefault();
      if (filename === "") {
        alert("Couldnt generate hierarchy over no policy file");
        return;
      }
      console.log(attribute_list);
      console.log(object_list);
      let uuid = uuidv4();
      let policy = {};
      policy["hierarchy-description"] =
        "This hierarchy policy was generated with PP-CTI's frontend.";
      policy.creator = creator;
      policy.organization = organization;
      policy.version = version;
      policy.uuid = uuid;
      if (flagatt) {
        let hierarchy_attributes = [];
        for (let atth of hattributes) {
          let ha = {};
          ha["attribute-name"] = atth.name;
          ha["attribute-type"] = atth.type;
          switch (atth.type) {
            case "static":
              let hierarchies = [];
              for (let h of atth.hierarchies) {
                //hierarchies.push({"generalization": h})
                hierarchies.push({
                  generalization: h,
                  interval: [],
                  regex: [],
                });
              }
              ha["attribute-generalization"] = hierarchies;
              break;
            case "regex":
              let h1 = atth.hierarchies[0];
              //ha['attribute-generalization'] = [{"regex": h1}]
              ha["attribute-generalization"] = [
                { generalization: [], interval: [], regex: h1 },
              ];
              break;
            case "interval":
              let interval_hierarchies = [];
              for (let h of atth.hierarchies) {
                let formatted_h = h.map((el, i) => {
                   if(i === 0 && !el.startsWith('<=')) return '<= ' + el;
                   if(i === h.length - 1 && !el.startsWith('>')) return '> ' + el;
                   return el;
                });
                interval_hierarchies.push({
                  generalization: [],
                  interval: formatted_h,
                  regex: [],
                });
              }
              ha["attribute-generalization"] = interval_hierarchies;
              break;
            case "None":
              alert("Hierarchy type cannot be None");
              reject("Hierarchy type cannot be None");
              break;
          }
          hierarchy_attributes.push(ha);
        }
        policy["hierarchy_attributes"] = hierarchy_attributes;
        policy["hierarchy_objects"] = [];
        let hierarchy_policy = { "Hierarchy-policy": policy };
        console.log(JSON.stringify(hierarchy_policy));
        //para pasar el fichero de jerarquías al App.js
        onGenerateHierarchy(JSON.stringify(hierarchy_policy));
        //download file
        const url = window.URL.createObjectURL(
          new Blob([JSON.stringify(hierarchy_policy)])
        );
        const link = document.createElement("a");
        link.href = url;
        let nameoffile = filename;
        nameoffile = nameoffile.replace(".json", "");
        console.log("file name " + nameoffile);
        link.setAttribute("download", nameoffile + "-hierarchy.json");
        document.body.appendChild(link);
        link.click();
        resolve("");
      } else {
        let hierarchy_objects = [];
        for (let object of hobjects) {
          console.log(`Adding hobject ${object.name} to ret`);
          console.log(object);
          let hierarchyattributes = [];
          for (let attribute of object.attributes) {
            if (attribute.name === "") {
              continue;
            }
            console.log(`Adding hobject.attribute ${attribute.name} to ret`);
            let ha = {};
            ha["attribute-name"] = attribute.name;
            ha["attribute-type"] = attribute.type;
            switch (attribute.type) {
              case "static":
                let hierarchies = [];
                for (let h of attribute.hierarchies) {
                  //hierarchies.push({"generalization": h})
                  hierarchies.push({
                    generalization: h,
                    interval: [],
                    regex: [],
                  });
                }
                ha["attribute-generalization"] = hierarchies;
                break;
              case "regex":
                let h1 = attribute.hierarchies[0];
                //ha['attribute-generalization'] = [{"regex": h1}]
                ha["attribute-generalization"] = [
                  { generalization: [], interval: [], regex: h1 },
                ];
                break;
              case "interval":
                let interval_hierarchies = [];
                for (let h of attribute.hierarchies) {
                  let formatted_h = h.map((el, i) => {
                     if(i === 0 && !el.startsWith('<=')) return '<= ' + el;
                     if(i === h.length - 1 && !el.startsWith('>')) return '> ' + el;
                     return el;
                  });
                  interval_hierarchies.push({
                    generalization: [],
                    interval: formatted_h,
                    regex: [],
                  });
                }
                ha["attribute-generalization"] = interval_hierarchies;
                break;
              case "None":
                alert("Hierarchy type cannot be None");
                reject("Hierarchy type cannot be None");
                break;
            }
            hierarchyattributes.push(ha);
          }
          let ho = {
            "misp-object-template": object.name,
            "attribute-hierarchies": hierarchyattributes,
          };
          hierarchy_objects.push(ho);
        }
        policy["hierarchy_objects"] = hierarchy_objects;
        policy["hierarchy_attributes"] = [];
        let hierarchy_policy = { "Hierarchy-policy": policy };
        console.log(JSON.stringify(hierarchy_policy));
        //para pasar el fichero de jerarquias al App.js
        onGenerateHierarchy(JSON.stringify(hierarchy_policy));
        //download file
        const url = window.URL.createObjectURL(
          new Blob([JSON.stringify(hierarchy_policy)])
        );
        const link = document.createElement("a");
        link.href = url;
        let nameoffile = filename;
        nameoffile = nameoffile.replace(".json", "");
        console.log("file name " + nameoffile);
        link.setAttribute("download", nameoffile + "-hierarchy.json");
        document.body.appendChild(link);
        link.click();
        resolve("");
      }
    });
  };

  return (

    <section
      tabIndex={0}
      className="section d-flex flex-column p-3"
      style={{ gap: "3rem" }}
    >
      {/* Toast Notification */}
      {toastVisible && (
        <div 
          className="alert alert-warning position-fixed top-0 start-50 translate-middle-x mt-4 shadow-sm" 
          style={{ zIndex: 1055, minWidth: "320px", textAlign: "center", borderRadius: "8px" }}
          role="alert"
        >
          ⚠️ {toastMsg}
        </div>
      )}

      <div className="container d-flex flex-column align-items-center">

        {/* Label de selección */}
        <div className="d-flex flex-column align-items-center mb-2">
          <label
            htmlFor="policy-file-input"
            className="form-label h5 mb-2 text-center"
          >
              Select privacy policy to process:
          </label>
        </div>

        {/* 1. Input */}
        <div className="w-100 d-flex justify-content-center mb-4">
          <input
            id="policy-file-input"
            type="file"
            accept=".json"
            onChange={(e) => handleFisleChosen(e.target.files[0])}
            className="form-control form-control-sm"
            style={{ maxWidth: 250 }}
          />
        </div>

        <h5 className="text-center mb-4">Hierarchy policy form</h5>

        {/* 2. Fila principal: Org / Creador / Versión / Botón */}
        <form onSubmit={handleSubmit} className="w-100">
          <div className="row justify-content-center align-items-end g-3">
            <div className="col-auto d-flex flex-column align-items-center">
              <label className="form-label">Organization</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="organization"
                required
                onChange={handleOrganization}
              />
            </div>
            <div className="col-auto d-flex flex-column align-items-center">
              <label className="form-label">Creator</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="creator"
                required
                onChange={handleCreator}
              />
            </div>
            <div className="col-auto d-flex flex-column align-items-center">
              <label className="form-label">Version</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="version"
                required
                onChange={handleVersion}
              />
            </div>
          </div>

          {/* Resto del formulario */}
          {(flagatt || flagobj) && (
            <div className="mt-5 d-flex flex-column align-items-center w-100">
              <div className="row ms-2 mt-2 w-100 justify-content-center">
                {flagatt &&
                  hattributes.map((attribute, index) => (
                    <div
                      key={index}
                      className="col-auto d-inline-block mt-2 border border-secondary rounded p-3"
                    >
                      <div className="row">
                        <div className="col-sm">
                          <small className="d-block">Attribute name</small>
                          <select
                            name="attname"
                            value={hattributes[index].name}
                            onChange={(e) => handleChangeAttributeName(e, index)}
                            className="form-select form-select-sm"
                          >
                            <option value="None">None</option>
                            {attribute_list.map((a) => (
                              <option key={a} value={a}>
                                {a}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-sm">
                          <small className="d-block">Type</small>
                          <select
                            name="atttype"
                            value={hattributes[index].type}
                            onChange={(e) => handleChangeAttributeType(e, index)}
                            className="form-select form-select-sm"
                          >
                            <option value="None">None</option>
                            <option value="static">static</option>
                            <option value="regex">regex</option>
                            <option value="interval">interval</option>
                          </select>
                        </div>
                      </div>
                      <div className="row mt-2">
                        <div className="col-sm">Hierarchies</div>
                      </div>
                      {attribute.hierarchies.map((hierarchyLevel, index_h) => (
                        <div key={index_h} className="mb-3 border-bottom pb-3">
                          <label className="fw-bold mb-2">Level {index_h + 1}</label>
                          {hierarchyLevel.map((element, index_e) => (
                            <div key={index_e} className="row mb-2">
                              
                              {/* Visual Aid for Interval */}
                              {attribute.type === 'interval' && (
                                <div className="col-auto d-flex align-items-center justify-content-center" style={{ width: '40px' }}>
                                  {index_e === 0 && (
                                    <span className="text-danger fw-bold" title="Less or Equal">&le;</span> // Using <= entity
                                  )}
                                  {index_e === hierarchyLevel.length - 1 && (
                                    <span className="text-danger fw-bold" title="Greater Than">&gt;</span>
                                  )}
                                </div>
                              )}
                              
                              <div className="col">
                                <div className="input-group input-group-sm">
                                  <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Value"
                                    required
                                    value={element}
                                    onChange={(e) =>
                                      handleChangeAttributeHierarchyElement(e, index, index_h, index_e)
                                    }
                                  />
                                  <button
                                    className="btn btn-outline-danger"
                                    type="button"
                                    onClick={() => handleRemoveAttributeHierarchyElement(index, index_h, index_e)}
                                    title="Remove this element"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                           <div className="d-flex justify-content-start mb-2">
                            <button
                                className="btn btn-outline-primary btn-sm"
                                type="button"
                                onClick={() => handleAddAttributeHierarchyElement(index, index_h)}
                            >
                              <i className="bi bi-plus-circle me-1"></i> Add element
                            </button>
                          </div>

                          <div className="row mt-1">
                            <div className="col">
                              <button
                                className="btn btn-primary btn-sm me-2"
                                type="button"
                                disabled={attribute.type === 'regex'}
                                onClick={() =>
                                  handleAddAttributeHierarchy(index, index_h)
                                }
                              >
                                Add hierarchy
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                type="button"
                                disabled={attribute.type === 'regex' || attribute.hierarchies.length <= 1}
                                onClick={() =>
                                  handleRemoveAttributeHierarchy(index, index_h)
                                }
                              >
                                Remove hierarchy
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="row mt-3">
                        <div className="col d-flex">
                          <button
                            className="btn btn-outline-secondary btn-sm me-2"
                            type="button"
                            onClick={() => addAttribute(index)}
                          >
                            <i className="bi bi-plus"></i> Add attribute
                          </button>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            type="button"
                            onClick={() => removeAttribute(index)}
                          >
                            <i className="bi bi-file-minus"></i> Remove attribute
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {flagobj &&
                  hobjects.map((object, index) => (
                    <div
                      key={index}
                      className="col-auto d-inline-block mt-2 border border-secondary rounded p-3 position-relative"
                    >
                      <button
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                        type="button"
                        onClick={() => removeObject(index)}
                      >
                        Remove object
                      </button>

                      <h5 className="d-block mt-4">
                        Selected Object: <span className="text-muted fw-normal">{hobjects[index].name}</span>
                      </h5>
                      <select
                        name="name"
                        className="form-select form-select-sm mb-3"
                        value={hobjects[index].name}
                        onChange={(e) => handleChangeObjectName(e, index)}
                      >
                        <option hidden value="None">Object type</option>
                        {object_list.map((o) => (
                          <option key={o.name} value={o.name}>
                            {o.name}
                          </option>
                        ))}
                      </select>

                      {hobjects[index].name && <h5 className="mt-4 mb-2">Attributes to apply hierarchies:</h5>}
                      {hobjects[index].name && object.attributes.map((attribute, index_a) => (
                        <div
                          key={index_a}
                          className="mb-3 p-3 border border-secondary rounded"
                        >
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="m-0">Selected attribute: <span className="text-muted fw-normal">{attribute.name}</span></h6>
                            <button
                              className="btn btn-danger btn-sm"
                              type="button"
                              onClick={() => removeObjectAttribute(index, index_a)}
                            >
                              <i className="bi bi-file-minus"></i> Remove attribute
                            </button>
                          </div>
                          
                          <select
                            className="form-select form-select-sm mb-2"
                            value={hobjects[index].attributes[index_a].name}
                            onChange={(e) =>
                              handleChangeObjectAttributeName(e, index, index_a)
                            }
                          >
                            <option hidden value="None">Attribute name</option>
                            {object_list
                              .find((el) => el.name === hobjects[index].name)
                              ?.attributes.map((a) => (
                                <option key={a.name} value={a.name}>
                                  {a.name}
                                </option>
                              ))}
                          </select>
                          
                          {attribute.name && (
                            <select
                              name="type"
                              className="form-select form-select-sm mb-2"
                              value={hobjects[index].attributes[index_a].type}
                              onChange={(e) =>
                                handleChangeObjectAttributeType(e, index, index_a)
                              }
                            >
                              <option hidden value="None">Hierarchy type</option>
                              <option value="static">static</option>
                              <option value="regex">regex</option>
                              <option value="interval">interval</option>
                            </select>
                          )}

                          {attribute.name && attribute.hierarchies.map((h, index_h) => (
                            <div key={index_h} className="mb-3 border-bottom pb-3">
                              <div className="d-flex align-items-center mb-2">
                                <span className="fw-bold text-secondary">
                                  L{index_h + 1}
                                </span>
                              </div>
                              
                              <div className="ms-3 mb-2">
                                {h.map((element, index_e) => (
                                  <div key={index_e} className="row mb-2">
                                    
                                      {/* Visual Aid for Interval */}
                                      {attribute.type === 'interval' && (
                                        <div className="col-auto d-flex align-items-center justify-content-center" style={{ width: '40px' }}>
                                          {index_e === 0 && (
                                            <span className="text-danger fw-bold" title="Less or Equal">&le;</span>
                                          )}
                                          {index_e === h.length - 1 && (
                                            <span className="text-danger fw-bold" title="Greater Than">&gt;</span>
                                          )}
                                        </div>
                                      )}

                                      <div className="col">
                                          <div className="input-group input-group-sm">
                                            <input
                                              className="form-control"
                                              type="text"
                                              placeholder="Value"
                                              required
                                              value={element}
                                              onChange={(e) =>
                                                handleChangeObjectAttributeHierarchyElement(
                                                  e,
                                                  index,
                                                  index_a,
                                                  index_h,
                                                  index_e
                                                )
                                              }
                                            />
                                            <button
                                              className="btn btn-outline-danger"
                                              type="button"
                                              onClick={() => handleRemoveObjectAttributeHierarchyElement(index, index_a, index_h, index_e)}
                                              title="Remove this element"
                                            >
                                              <i className="bi bi-trash"></i>
                                            </button>
                                          </div>
                                      </div>
                                  </div>
                                ))}
                                <button
                                  className="btn btn-outline-primary btn-sm mb-2"
                                  type="button"
                                  onClick={() => handleAddObjectAttributeHierarchyElement(index, index_a, index_h)}
                                >
                                  <i className="bi bi-plus-circle me-1"></i> Add element
                                </button>
                              </div>


                              <div className="d-flex justify-content-between align-items-center">
                                  <button
                                      className="btn btn-primary btn-sm"
                                      type="button"
                                      disabled={hobjects[index].attributes[index_a].type === 'regex'}
                                      onClick={() =>
                                        handleAddObjectAttributeHierarchy(
                                          index,
                                          index_a,
                                          index_h
                                        )
                                      }
                                    >
                                      Add level
                                    </button>
                                    
                                    <button
                                      className="btn btn-danger btn-sm text-nowrap"
                                      type="button"
                                      disabled={
                                        hobjects[index].attributes[index_a].type === 'regex' ||
                                        hobjects[index].attributes[index_a].hierarchies.length <= 1
                                      }
                                      onClick={() =>
                                        handleRemoveObjectAttributeHierarchy(
                                          index,
                                          index_a,
                                          index_h
                                        )
                                      }
                                    >
                                      Remove level
                                    </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}

                      {hobjects[index].name && (
                        <div className="d-flex justify-content-center">
                          <button
                            className="btn btn-primary btn-sm me-2"
                            type="button"
                            onClick={() => addObjectAttribute(index, object.attributes.length - 1)}
                          >
                            <i className="bi bi-plus"></i> Add attribute
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                {flagobj && (  
                  <div className="d-flex justify-content-center w-100 mt-2">
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      onClick={addObject}
                    >
                      Add object
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="col-auto mt-4">
            <button type="submit" className="btn btn-primary btn-sm ms-1 mt-2 btn-privacy">
              Generate hierarchy policy
            </button>
          </div>
        </form>

      </div>

    </section>
  );

});
export default Hierarchy;
